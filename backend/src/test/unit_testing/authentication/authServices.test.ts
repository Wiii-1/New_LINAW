import { randomBytes, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { AuthService } from "../../../modules/authentication/authServices.js";
import { AuthRepository } from "../../../modules/authentication/authRepository.js";
import { hashPassword } from "../../../modules/authentication/authPassword.js";
import { UnauthorizedAccessError } from "../../../shared/errors/appError.js";
import { resetPasswordSchema } from "../../../modules/authentication/authValidator.js";
import type { AuthNotifier } from "../../../modules/authentication/authNotifications.js";

type UserRecord = {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  status: string;
  credentials: {
    password_hash: string;
  };
  tenant: {
    id: string;
  };
};

type SessionRecord = {
  id: string;
  tenant_id: string;
  user_id: string;
  refresh_token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
};

type PasswordResetTokenRecord = {
  id: string;
  tenant_id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
};

class InMemoryAuthRepository {
  users = new Map<string, UserRecord>();
  sessions = new Map<string, SessionRecord>();
  resetTokens = new Map<string, PasswordResetTokenRecord>();

  async findUserWithCredentialsByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }

    return null;
  }

  async findUserWithCredentialsById(userId: string) {
    return this.users.get(userId) ?? null;
  }

  async findUserById(userId: string) {
    return this.users.get(userId) ?? null;
  }

  async createTenant(data: { tenant_id: string; status: string; plan: string }) {
    return {
      id: data.tenant_id,
      status: data.status,
      plan: data.plan,
    };
  }

  async createUser(data: {
    tenant_id: string;
    first_name: string;
    last_name: string;
    job_title: string;
    email: string;
    status: string;
  }) {
    const id = randomUUID();
    const user: UserRecord = {
      id,
      tenant_id: data.tenant_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      job_title: data.job_title,
      status: data.status,
      credentials: {
        password_hash: "",
      },
      tenant: {
        id: data.tenant_id,
      },
    };

    this.users.set(id, user);
    return user;
  }

  async createUserCredentials(data: { user_id: string; password_hash: string }) {
    const user = this.users.get(data.user_id);

    if (!user) {
      throw new Error("user missing");
    }

    user.credentials.password_hash = data.password_hash;
    return { user_id: data.user_id, password_hash: data.password_hash };
  }

  async createSession(data: {
    tenant_id: string;
    user_id: string;
    refresh_token_hash: string;
    expires_at: Date;
  }) {
    const id = randomUUID();
    const session: SessionRecord = {
      id,
      tenant_id: data.tenant_id,
      user_id: data.user_id,
      refresh_token_hash: data.refresh_token_hash,
      expires_at: data.expires_at,
      revoked_at: null,
    };

    this.sessions.set(id, session);
    return session;
  }

  async updateSessionToken(sessionId: string, refreshTokenHash: string) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error("session missing");
    }

    session.refresh_token_hash = refreshTokenHash;
    return session;
  }

  async findSessionById(sessionId: string) {
    return this.sessions.get(sessionId) ?? null;
  }

  async revokedSession(id: string) {
    const session = this.sessions.get(id);

    if (!session) {
      throw new Error("session missing");
    }

    session.revoked_at = new Date();
    return session;
  }

  async revokeAllSessionsForUser(userId: string, revokedAt: Date) {
    for (const session of this.sessions.values()) {
      if (session.user_id === userId && !session.revoked_at) {
        session.revoked_at = revokedAt;
      }
    }

    return { count: 1 };
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error("user missing");
    }

    user.credentials.password_hash = passwordHash;
    return user;
  }

  async createPasswordResetToken(data: {
    id: string;
    tenant_id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
  }) {
    const record: PasswordResetTokenRecord = {
      ...data,
      used_at: null,
    };

    this.resetTokens.set(data.id, record);
    return record;
  }

  async findPasswordResetTokenById(id: string) {
    return this.resetTokens.get(id) ?? null;
  }

  async markPasswordResetTokenUsed(id: string, usedAt: Date) {
    const token = this.resetTokens.get(id);

    if (!token) {
      throw new Error("token missing");
    }

    token.used_at = usedAt;
    return token;
  }

  async markPasswordResetTokensForUserUsed(userId: string, usedAt: Date) {
    for (const token of this.resetTokens.values()) {
      if (token.user_id === userId && !token.used_at) {
        token.used_at = usedAt;
      }
    }

    return { count: 1 };
  }
}

class CapturingNotifier implements AuthNotifier {
  calls: Array<{ email: string; resetLink: string }> = [];

  async sendPasswordResetEmail(input: { email: string; resetLink: string }) {
    this.calls.push(input);
  }
}

async function buildService() {
  const repository = new InMemoryAuthRepository();
  const notifier = new CapturingNotifier();
  const service = new AuthService(repository as unknown as AuthRepository, notifier);

  const tenantId = randomUUID();
  const passwordHash = await hashPassword("initial-password-123");

  const user = await repository.createUser({
    tenant_id: tenantId,
    first_name: "Reset",
    last_name: "User",
    job_title: "Manager",
    email: "user@example.com",
    status: "ACTIVE",
  });

  await repository.createUserCredentials({
    user_id: user.id,
    password_hash: passwordHash,
  });

  await repository.createSession({
    tenant_id: tenantId,
    user_id: user.id,
    refresh_token_hash: "placeholder",
    expires_at: new Date(Date.now() + 86_400_000),
  });

  return { service, repository, notifier, user };
}

describe("AuthService password reset", () => {
  it("returns the same response for existing and nonexistent reset requests", async () => {
    const { service, notifier } = await buildService();

    const existing = await service.requestPasswordReset({ email: "user@example.com" });
    const missing = await service.requestPasswordReset({ email: "missing@example.com" });

    expect(existing).toEqual({ success: true });
    expect(missing).toEqual({ success: true });
    expect(notifier.calls).toHaveLength(1);
  });

  it("creates a reset link with the configured app URL", async () => {
    const { service, notifier } = await buildService();

    await service.requestPasswordReset({ email: "user@example.com" });

    expect(notifier.calls).toHaveLength(1);
    expect(notifier.calls[0]?.resetLink).toContain("token=");
    expect(notifier.calls[0]?.resetLink).toContain("http://localhost:3000");
  });

  it("rejects an invalid token", async () => {
    const { service } = await buildService();

    await expect(
      service.resetPassword({
        resetToken: "bad-token",
        password: "new-password-123",
        confirmPassword: "new-password-123",
      })
    ).rejects.toBeInstanceOf(UnauthorizedAccessError);
  });

  it("rejects an expired token", async () => {
    const { service, repository, user } = await buildService();
    const tokenSecret = randomBytes(32).toString("base64url");
    const tokenId = randomUUID();

    await repository.createPasswordResetToken({
      id: tokenId,
      tenant_id: user.tenant_id,
      user_id: user.id,
      token_hash: await hashPassword(tokenSecret),
      expires_at: new Date(Date.now() - 1_000),
    });

    await expect(
      service.resetPassword({
        resetToken: `${tokenId}.${tokenSecret}`,
        password: "new-password-123",
        confirmPassword: "new-password-123",
      })
    ).rejects.toBeInstanceOf(UnauthorizedAccessError);
  });

  it("rejects an already used token", async () => {
    const { service, repository, user } = await buildService();
    const tokenSecret = randomBytes(32).toString("base64url");
    const tokenId = randomUUID();

    await repository.createPasswordResetToken({
      id: tokenId,
      tenant_id: user.tenant_id,
      user_id: user.id,
      token_hash: await hashPassword(tokenSecret),
      expires_at: new Date(Date.now() + 3_600_000),
    });

    await repository.markPasswordResetTokenUsed(tokenId, new Date());

    await expect(
      service.resetPassword({
        resetToken: `${tokenId}.${tokenSecret}`,
        password: "new-password-123",
        confirmPassword: "new-password-123",
      })
    ).rejects.toBeInstanceOf(UnauthorizedAccessError);
  });

  it("rejects a token with the wrong secret", async () => {
    const { service, repository, user } = await buildService();
    const tokenId = randomUUID();

    await repository.createPasswordResetToken({
      id: tokenId,
      tenant_id: user.tenant_id,
      user_id: user.id,
      token_hash: await hashPassword("correct-secret"),
      expires_at: new Date(Date.now() + 3_600_000),
    });

    await expect(
      service.resetPassword({
        resetToken: `${tokenId}.${randomBytes(32).toString("base64url")}`,
        password: "new-password-123",
        confirmPassword: "new-password-123",
      })
    ).rejects.toBeInstanceOf(UnauthorizedAccessError);
  });

  it("rejects password validation failures before reset", () => {
    const parsed = resetPasswordSchema.safeParse({
      resetToken: "token.value",
      password: "short",
      confirmPassword: "short",
    });

    expect(parsed.success).toBe(false);
  });

  it("resets the password, revokes sessions, and prevents token reuse", async () => {
    const { service, repository, notifier, user } = await buildService();

    await service.requestPasswordReset({ email: user.email });
    const resetLink = notifier.calls[0]?.resetLink;

    expect(resetLink).toBeTruthy();

    const token = new URL(resetLink!).searchParams.get("token");
    expect(token).toBeTruthy();

    const result = await service.resetPassword({
      resetToken: token!,
      password: "new-password-123",
      confirmPassword: "new-password-123",
    });

    expect(result).toEqual({ success: true });
    expect(repository.users.get(user.id)?.credentials.password_hash).not.toBe("initial-password-123");
    expect(Array.from(repository.sessions.values()).every((session) => session.revoked_at)).toBe(true);

    await expect(
      service.resetPassword({
        resetToken: token!,
        password: "another-password-123",
        confirmPassword: "another-password-123",
      })
    ).rejects.toBeInstanceOf(UnauthorizedAccessError);
  });
});
