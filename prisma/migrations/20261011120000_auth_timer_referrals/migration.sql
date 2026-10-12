-- Add account authentication, referral tracking and quiz duration fields.
ALTER TABLE "User"
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "referralCode" TEXT,
  ADD COLUMN "referredBy" TEXT;

CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

ALTER TABLE "Attempt" ADD COLUMN "durationSeconds" INTEGER;
