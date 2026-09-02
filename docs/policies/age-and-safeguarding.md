# Age and safeguarding policy (draft for counsel)

**Status: draft. Requires review by Australian counsel before publication.**

1. MigRent is for people aged 18 and over. Creating an account requires confirming this (sign-up consent, `over_18_confirmed_at` on the profile). The API refuses `age` values under 18 and refuses to complete onboarding without the confirmation. A listing cannot be published unless its owner has confirmed they are 18+ (database trigger).
2. If MigRent has reason to believe a profile belongs to someone under 18:
   - the profile is removed from public display immediately using `backend/scripts/admin/hide_profile_if_minor.sql` (reversible, deletes nothing);
   - any listings by that profile are paused;
   - the account holder is contacted at the account email asking for a guardian to get in touch;
   - no personal details of the possible minor are copied into tickets, logs, screenshots or fixtures;
   - if a guardian confirms the account holder is under 18, the account is closed and data deleted under the retention schedule.
3. Hosts must not knowingly offer accommodation to an unaccompanied minor through MigRent. Seekers must not book on behalf of a minor.
4. Reports of a minor on the platform go to `migrentau@gmail.com` and are treated as safety reports (see `/safety-reporting`).

Open questions for counsel: whether the over-18 confirmation should be re-collected for existing accounts; whether ID verification should cross-check date of birth for hosts; data-retention period for closed accounts.
