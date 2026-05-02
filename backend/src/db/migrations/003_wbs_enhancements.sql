-- WBS Explorer Enhancements
-- Adding columns for sorting, planning, audit, and path

-- Add new columns to wbs_nodes table
ALTER TABLE wbs_nodes 
ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS planned_quantity DECIMAL(14, 3),
ADD COLUMN IF NOT EXISTS planned_unit VARCHAR(50),
ADD COLUMN IF NOT EXISTS planned_start DATE,
ADD COLUMN IF NOT EXISTS planned_end DATE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS path LTREE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS wbs_nodes_project_parent_sort_idx ON wbs_nodes(project_id, parent_id, sort_order);
CREATE INDEX IF NOT EXISTS wbs_nodes_path_gist ON wbs_nodes USING GIST(path);
CREATE INDEX IF NOT EXISTS idx_wbs_nodes_updated ON wbs_nodes(updated_at);

-- Enable LTREE extension if not already enabled
CREATE EXTENSION IF NOT EXISTS ltree;

-- Create trigger function to maintain path on insert/update
CREATE OR REPLACE FUNCTION update_wbs_path()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.parent_id IS NULL THEN
            NEW.path := NEW.id::text;
        ELSE
            SELECT parent.path || '.' || NEW.id::text INTO NEW.path
            FROM wbs_nodes parent
            WHERE parent.id = NEW.parent_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
            -- Parent changed, need to update path for this node and all descendants
            IF NEW.parent_id IS NULL THEN
                NEW.path := NEW.id::text;
            ELSE
                SELECT parent.path || '.' || NEW.id::text INTO NEW.path
                FROM wbs_nodes parent
                WHERE parent.id = NEW.parent_id;
            END IF;
            
            -- Update all descendants
            UPDATE wbs_nodes 
            SET path = NEW.path || SUBSTRING(path FROM (STRPOS(OLD.path, '.') + 1))
            WHERE path <@ OLD.path;
            
            RETURN NEW;
        END IF;
        -- Update updated_at timestamp
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;
    RETURN NULL; -- control should never reach here
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_wbs_path_on_wbs_nodes ON wbs_nodes;
CREATE TRIGGER trg_wbs_path_on_wbs_nodes
    BEFORE INSERT OR UPDATE ON wbs_nodes
    FOR EACH ROW EXECUTE FUNCTION update_wbs_path();

-- Create function to rebuild all paths (useful for initial data or after bulk operations)
CREATE OR REPLACE FUNCTION rebuild_wbs_paths()
RETURNS VOID AS $$
DECLARE
    node RECORD;
BEGIN
    -- Update root nodes (no parent)
    UPDATE wbs_nodes 
    SET path = id::text 
    WHERE parent_id IS NULL;
    
    -- Update child nodes iteratively until no changes
    LOOP
        UPDATE wbs_nodes child
        SET path = parent.path || '.' || child.id::text
        FROM wbs_nodes parent
        WHERE child.parent_id = parent.id
          AND child.path IS DISTINCT FROM parent.path || '.' || child.id::text;
          
        IF NOT FOUND THEN
            EXIT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;