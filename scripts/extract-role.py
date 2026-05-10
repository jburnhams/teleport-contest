import re

def process_c_struct_to_js(text, struct_type):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL) # remove comments
    text = text.replace('NON_PM', 'C.NON_PM')

    # Prefix constants with C.
    prefixes = ['PM_', 'MH_', 'ROLE_', 'S_', 'A_', 'SPE_', 'ART_', 'AM_']
    for p in prefixes:
        text = re.sub(r'\b(' + p + r'[A-Za-z0-9_]+)\b', r'C.\1', text)

    text = re.sub(r'STR18\(([0-9]+)\)', r'118', text)

    return text

with open('/tmp/roles_c.txt', 'r') as f:
    roles_text = f.read()

roles_js = process_c_struct_to_js(roles_text, "roles")

with open('/tmp/roles_intermediate.js', 'w') as f:
    f.write(roles_js)
