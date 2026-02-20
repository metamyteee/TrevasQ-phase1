from pydantic import BaseModel
from typing import List, Tuple

class KeyResponse(BaseModel):
    public_key: Tuple[List[List[int]], List[int]]
    secret_key: List[int]

class EncryptRequest(BaseModel):
    public_key: Tuple[List[List[int]], List[int]]
    message: str

class EncryptResponse(BaseModel):
    ciphertext: List[Tuple[List[int], int]]

class DecryptRequest(BaseModel):
    secret_key: List[int]
    ciphertext: List[Tuple[List[int], int]]

class DecryptResponse(BaseModel):
    plaintext: str
