#####################################################################
#                                                                   #
# Script to import the autoreload extension on IPython startup.     #
# The location of this file will typically be in the                #
# .ipython/profile_default/startup directory, see                   #
# https://ipython.org/ipython-doc/3/config/intro.html for more info #
#                                                                   #
#####################################################################

def load_ipython_autoreload():
    """
    Loads the autoreload extension by code.
    Loading this extension through the ipython_config.py file can be done
    with the following lines:

    c.InteractiveShellApp.exec_lines = [
        "%autoreload 2",
    ]
    c.InteractiveShellApp.extensions = [
        "autoreload",
    ]
    
    However, the `get_autoreload_status` function may not show the correct
    status of the autoreload extension because of startup execution order.
    """
    ipython = get_ipython()
    ipython.run_line_magic("load_ext", "autoreload")
    ipython.run_line_magic("autoreload", "2")

def get_autoreload_status():
    """
    Returns a tuple of (autoreload_enabled: bool, autoreload_mode: int).
    """
    ipython = get_ipython()
    autoreload = ipython.magics_manager.magics["line"].get("autoreload", None)
    if autoreload is None:
        return (False, 0)
    reloader = autoreload.__self__._reloader
    check_all = reloader.check_all
    enabled = reloader.enabled
    
    if not enabled:
        return (enabled, 0)
    
    if not check_all:
        return (enabled, 1)
    else:
        return (enabled, 2)


load_ipython_autoreload()
_ipython_autoreload_status = get_autoreload_status()
if _ipython_autoreload_status[0]:
    print(f">> Using %autoreload {_ipython_autoreload_status[1]}.")
else:
    print(">> %autoreload is disabled.")
