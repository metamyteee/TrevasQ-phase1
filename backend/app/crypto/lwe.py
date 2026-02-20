import numpy as np
n = 32
q = 512
noise_bound = 1
REPEAT = 10

def keygen():
    s = np.random.randint(0, q, size=n)
    A = np.random.randint(0, q, size=(n, n))
    e = np.random.randint(-noise_bound, noise_bound + 1, size=n)

    b = (A @ s + e) % q

    return (A.tolist(), b.tolist()), s.tolist()

def text_to_bits(text):
    bits = []
    for ch in text:
        byte = format(ord(ch), "08b")
        bits.extend([int(b) for b in byte])
    return bits

def bits_to_text(bits):
    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i:i + 8]
        chars.append(chr(int("".join(map(str, byte)), 2)))
    return "".join(chars)


def encrypt_text(public_key, message):
    A = np.array(public_key[0])
    b = np.array(public_key[1])

    bits = text_to_bits(message)
    ciphertext = []

    for m in bits:
        for _ in range(REPEAT):
            r = np.random.randint(0, 2, size=n)

            u = (r @ A) % q
            v = (r @ b + m * (q // 2)) % q

            ciphertext.append((u.tolist(), int(v)))

    return ciphertext

def decrypt_text(secret_key, ciphertext):
    s = np.array(secret_key)

    recovered_bits = []

    for i in range(0, len(ciphertext), REPEAT):
        chunk = ciphertext[i:i + REPEAT]

        votes = []

        for u, v in chunk:
            u = np.array(u)
            m = (v - u @ s) % q
            bit = 1 if m > q // 4  else 0
            votes.append(bit)

        recovered_bits.append(1 if sum(votes) > REPEAT // 2 else 0)

    return bits_to_text(recovered_bits)
