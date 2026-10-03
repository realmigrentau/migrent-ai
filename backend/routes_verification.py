"""The old path for the renter ID check's payment. The check itself lives
in renter_id.py (POST /hub/id-check/checkout); this keeps older pages that
still post here working."""

from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request

router = APIRouter(prefix="/payments", tags=["verification"])


@router.post("/create-verification-session")
def create_verification_session(request: Request, authorization: Optional[str] = Header(None)):
    from renter_id import enabled, id_check_checkout

    if not enabled():
        raise HTTPException(status_code=410, detail="The ID check isn't available yet.")
    return id_check_checkout(request, authorization)
