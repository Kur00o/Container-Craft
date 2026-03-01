from fastapi import FastAPI, Header, HTTPException, Request, Response
from pydantic import list
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# we are yet to add the origin urls, on hold as of now.
origins = []

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.get("/api/health")
async def health_check():
    return {"status" : "Healthy"}
