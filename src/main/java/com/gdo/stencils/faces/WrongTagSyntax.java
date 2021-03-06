/**
 * <p>This exception is raised when the stencil face has syntax error in stencil tags.<p>
 *

 * <p>&copy; 2004, 2008 StudioGdo/Guillaume Doumenc. All Rights Reserved.
 * This software is the proprietary information of StudioGdo &amp; Guillaume Doumenc.
 * Use is subject to license terms.</p>

 */
package com.gdo.stencils.faces;

@SuppressWarnings("serial")
public class WrongTagSyntax extends Exception {

    public WrongTagSyntax(String msg) {
        super(msg);
    }
}
