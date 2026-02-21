from fastapi import APIRouter
from app.crypto.lwe import keygen, encrypt_text, decrypt_text
from app.models.schemas import (
    KeyResponse,
    EncryptRequest,
    EncryptResponse,
    DecryptRequest,
    DecryptResponse
)

router = APIRouter()


@router.get("/")
def home():
    return {"message": "LWE API running"}


@router.post("/keygen", response_model=KeyResponse)
def api_keygen():
    public_key, secret_key = keygen()
    return {
        "public_key": public_key,
        "secret_key": secret_key,
    }


@router.post("/encrypt", response_model=EncryptResponse)
def api_encrypt(data: EncryptRequest):
    ciphertext = encrypt_text(data.public_key, data.message)
    return {"ciphertext": ciphertext}


@router.post("/decrypt", response_model=DecryptResponse)
def api_decrypt(data: DecryptRequest):
    plaintext = decrypt_text(data.secret_key, data.ciphertext)
    return {"plaintext": plaintext}
