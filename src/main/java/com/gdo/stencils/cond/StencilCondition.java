/**
 * Copyright GDO - 2005
 */
package com.gdo.stencils.cond;

import com.gdo.stencils._StencilContext;
import com.gdo.stencils.plug._PStencil;

/**
 * <p>
 * Stencil condition used to filter stencils in a slot.
 * </p>
 */
public abstract class StencilCondition<C extends _StencilContext, S extends _PStencil<C, S>> {

    public static final String NOT = "!";

    /**
     * Condition verified by the stencil to be filtered.
     * 
     * @param stclContext
     *            the stencil context.
     * @param stencil
     *            the stencil which will tested.
     * @return <tt>true</tt> if the stencil verifies the condition.
     */
    public abstract boolean verify(C stclContext, S stencil);

    /**
     * Transforms the condition in a SQL condition statement.
     * 
     * @param stclContext
     *            the stencil context.
     * @param alias
     *            the table inner alias.
     * @return the SQL condition statement.
     */
    public abstract String toSQL(C stclContext, String alias, S stencil);

}
