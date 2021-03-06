package com.gdo.sql.slot;

import java.sql.ResultSet;

import org.apache.commons.lang3.StringUtils;

import com.gdo.project.slot._SlotCursor;
import com.gdo.sql.model.SQLContextStcl;
import com.gdo.sql.model.SQLStcl;
import com.gdo.stencils.Result;
import com.gdo.stencils.Stcl;
import com.gdo.stencils.StclContext;
import com.gdo.stencils.factory.StencilFactory;
import com.gdo.stencils.key.IKey;
import com.gdo.stencils.plug.PSlot;
import com.gdo.stencils.plug.PStcl;
import com.gdo.stencils.util.StencilUtils;

public class SQLCursor extends _SlotCursor {

    private boolean _initialized;

    public SQLCursor(String name, int size) {
        super(name, size);
    }

    /**
     * Checks if the slot was initialized.
     */
    public boolean isInitialized() {
        return _initialized;
    }

    public void setInitialized() {
        _initialized = true;
    }

    @Override
    protected SQLCreatedStcl createStencil(StclContext stclContext, PSlot<StclContext, PStcl> container, PSlot<StclContext, PStcl> slot, IKey key) {

        // get keys query
        SQLSlot sqlSlot = container.getSlot();
        String query = sqlSlot.getKeysQueryWithoutCondition(stclContext, key.toString(), container);
        if (StringUtils.isEmpty(query)) {
            String msg = logWarn(stclContext, "Stencil query not defined for slot %s for create stencil", slot);
            return new SQLCreatedStcl(Stcl.nullPStencil(stclContext, Result.error(msg)), null);
        }

        // get sql context
        PStcl sqlContext = sqlSlot.getSQLContext(stclContext, container);
        if (StencilUtils.isNull(sqlContext)) {
            String msg = logWarn(stclContext, "No SQL context defined for slot %s for create stencil", slot);
            return new SQLCreatedStcl(Stcl.nullPStencil(stclContext, Result.error(msg)), null);
        }
        SQLContextStcl context = (SQLContextStcl) sqlContext.getReleasedStencil(stclContext);

        // creates the stencil
        ResultSet rs = context.selectQuery(stclContext, query, sqlContext);
        if (rs != null) {
            try {
                StencilFactory<StclContext, PStcl> factory = (StencilFactory<StclContext, PStcl>) stclContext.getStencilFactory();

                if (!rs.next()) {
                    String msg = logWarn(stclContext, "Stencil was removed from database in %s at key (no more in cursor)", slot, key);
                    return new SQLCreatedStcl(Stcl.nullPStencil(stclContext, Result.error(msg)), null);
                }

                // creates the stencil
                String template = sqlSlot.getStencilTemplate(stclContext, rs, container);
                PStcl stcl;
                if (StringUtils.isEmpty(template)) {
                    stcl = factory.createPProperty(stclContext, slot, key, "");
                } else {
                    Object params[] = sqlSlot.getStencilParameters(stclContext, rs, container);
                    stcl = factory.createPStencil(stclContext, slot, key, template, params);
                }

                // checks the stencil is a SQLStcl
                if (!(stcl.getReleasedStencil(stclContext) instanceof SQLStcl)) {
                    String msg = logWarn(stclContext, "The template %s must be an instance of SQLStcl to be inserted in the SQLSlot %s", template, slot);
                    return new SQLCreatedStcl(Stcl.nullPStencil(stclContext, Result.error(msg)), null);
                }

                // adds containing slot
                SQLStcl sql = (SQLStcl) stcl.getReleasedStencil(stclContext);
                sql.setSQLContext(sqlContext);
                sql.setSQLContainerSlot(container);

                return new SQLCreatedStcl(stcl, rs);
            } catch (Exception e) {
                String msg = logError(stclContext, "%s", e);
                return new SQLCreatedStcl(Stcl.nullPStencil(stclContext, Result.error(msg)), null);
            }
        }

        // no stencil found from query
        String msg = logError(stclContext, "No stencil found (%s)", query);
        return new SQLCreatedStcl(Stcl.nullPStencil(stclContext, Result.error(msg)), null);
    }

    @Override
    protected PStcl completeCreatedStencil(StclContext stclContext, PSlot<StclContext, PStcl> container, PSlot<StclContext, PStcl> slot, IKey key, CreatedStcl created) {
        PStcl stencil = ((SQLCreatedStcl) created)._created;
        ResultSet rs = ((SQLCreatedStcl) created)._rs;
        if (rs != null) {
            try {

                // completes stencil
                Stcl stcl = stencil.getReleasedStencil(stclContext);
                if (stcl instanceof SQLStcl) {
                    ((SQLStcl) stcl).completeCreatedSQLStencil(stclContext, rs, stencil);
                } else {
                    SQLSlot sqlSlot = slot.getSlot();
                    sqlSlot.completeStencil(stclContext, stencil, rs, container);
                    logError(stclContext, "Should not use any more non SQLStcl %s in SQLSlot %s", stcl, slot);
                }

                // completes plug operation
                slot.getSlot().afterPlug(stclContext, stencil, slot);
            } catch (Exception e) {
                logError(stclContext, "%s", e);
            } finally {
                SQLContextStcl.closeResultSet(rs);
            }
        }
        return stencil;
    }

    protected class SQLCreatedStcl extends CreatedStcl {
        public ResultSet _rs;

        protected SQLCreatedStcl(PStcl created, ResultSet rs) {
            super(created);
            _rs = rs;
        }
    }

}