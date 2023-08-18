from collections import defaultdict
from enum import Enum
import re
from fastapi.exceptions import RequestValidationError

import subprocess

from typing import Union
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# * This is necessary.
# ! Fuck this shit.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    print(exc)
    return PlainTextResponse(str(exc.detail), status_code=exc.status_code)

@app.exception_handler(RequestValidationError)
async def method_not_allowed_exception_handler(request, exc):
    print(exc)
    return PlainTextResponse(str(exc))

@app.get("/")
def read_root(response: Response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return {"Hello": "World"}


class Item(BaseModel):
    name: str
    tax: int

@app.post("/items/")
def read_item(item: Item):
    print(item)
    return {"item": item,}

class Code(BaseModel):
    content: str

@app.post("/compile/")
def compile_code(code: Code):

    p = subprocess.run(['python3', '-c', code.content], stdout=subprocess.PIPE)
    output = p.stdout.decode('utf-8').strip()

    return output

@app.post("/interactive/")
def interactive_code(code: Code):

    '''
    Insert output of interactive mode below every line starting with '>>> '
    '''

    pattern = re.compile(r".*=.*")
    modified_content = ""
    insert_indices: list[int] = []
    for i, s in enumerate(code.content.splitlines()):
        if s[:4] == '>>> ':
            if pattern.match(s[4:]):
                modified_content += s[4:] + '\n'
            else:
                # ? This is the case where we should insert output.

                insert_indices.append(i)
                tmp_var = "rand182479126638183"
                modified_content += f'{tmp_var} = None\n'
                modified_content += f'{tmp_var} = {s[4:]}\n'
                modified_content += f'if {tmp_var} is not None:\n' 
                modified_content += f'\tprint("__SPECIAL__HEADER__{i}: " + repr({tmp_var}))\n'
        else:
            modified_content += s 
    # print(modified_content)

    p = subprocess.run(['python3', '-c', modified_content], stdout=subprocess.PIPE)
    output = p.stdout.decode('utf-8').strip()
    outputmap: dict[int, str] = defaultdict(lambda: "")
    for line in output.splitlines():
        if obj := re.match(r"__SPECIAL__HEADER__(\d)+: (.*)", line):
            outputmap[int(obj.group(1))] = obj.group(2) + '\n'
    
    
    result = "".join(s + '\n' + outputmap[i] for i, s in enumerate(code.content.splitlines()))
    print(result)
    return result
