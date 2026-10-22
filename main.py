"""Glow & Go - Python (PyScript) part: checkout validation.
app.js calls py_validate() when an order is placed (event-driven: form submit -> Python)."""
import json, re
from js import window
from pyodide.ffi import create_proxy


def validate(name, phone, email, addr):
    errs = {
        "name": "Enter your full name." if len(name.strip()) < 2 else "",
        "phone": "" if re.fullmatch(r"(09|\+639)\d{9}", phone.replace(" ", "")) else "Use a PH mobile number like 09171234567.",
        "email": "" if re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) else "Enter a valid email address.",
        "addr": "Enter a complete delivery address (at least 10 characters)." if len(addr.strip()) < 10 else "",
    }
    return json.dumps(errs)


window.py_validate = create_proxy(validate)
window.pyReady = True
