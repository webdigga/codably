---
title: "Authentication Patterns Every Developer Should Know"
description: "A practical guide to authentication patterns including sessions, JWTs, OAuth 2.0, and passkeys, with trade-offs and implementation advice."
publishDate: "2026-03-22"
author: "jonny-rowse"
category: "backend"
tags: ["authentication", "security", "backend", "oauth", "jwt", "passkeys"]
featured: false
draft: false
faqs:
  - question: "What is the difference between authentication and authorisation?"
    answer: "Authentication verifies who someone is. Authorisation determines what they are allowed to do. Authentication happens first: the user proves their identity with a password, token, or biometric. Authorisation happens after: the system checks whether that identity has permission to access a specific resource. Mixing these up leads to security vulnerabilities where authenticated users can access things they should not."
  - question: "Should I use JWTs or server-side sessions?"
    answer: "It depends on your architecture. Server-side sessions are simpler and easier to revoke, making them a good default for traditional web applications. JWTs work well for stateless APIs and microservices where you do not want every request to hit a session store. Many production systems use both: a session cookie for the web frontend and JWTs for API-to-API communication."
  - question: "Is it safe to store JWTs in localStorage?"
    answer: "No. LocalStorage is accessible to any JavaScript running on the page, making it vulnerable to cross-site scripting (XSS) attacks. Store JWTs in HttpOnly cookies instead, which cannot be read by JavaScript. If you must use localStorage, ensure your application has robust XSS protection, but HttpOnly cookies are the safer default."
  - question: "Should I build authentication myself or use a third-party service?"
    answer: "For most applications, use a third-party service or well-maintained library. Authentication is security-critical code where small mistakes create serious vulnerabilities. Services like Auth0, Clerk, and Firebase Auth handle password hashing, token management, MFA, and account recovery so you do not have to. Build it yourself only if you have specific requirements that no existing solution meets and the expertise to do it safely."
  - question: "What is the most secure authentication method available today?"
    answer: "Passkeys (WebAuthn/FIDO2) are currently the most secure widely available authentication method. They are phishing-resistant because they are bound to the specific domain, they cannot be reused across sites, and they do not rely on shared secrets like passwords. Combined with biometric verification on the device, they eliminate the most common attack vectors. Adoption is growing rapidly, with major platforms and browsers now supporting them."
primaryKeyword: "authentication patterns"
---

Authentication is the one piece of your application that you absolutely cannot get wrong. A bug in your pagination logic is annoying. A bug in your authentication logic is a data breach.

Yet many developers treat authentication as a solved problem, something you bolt on with a library and never think about again. The reality is that choosing the right authentication pattern for your application requires understanding the trade-offs between security, user experience, and architectural complexity. This guide covers the patterns you are most likely to encounter and when to use each one.

## Session-Based Authentication

Session-based authentication is the oldest and most straightforward pattern. The server creates a session after the user logs in, stores it (usually in memory or a database), and sends the client a session ID in a cookie.

### How it works

1. User submits credentials (username and password)
2. Server validates credentials and creates a session record
3. Server sends back a cookie containing the session ID
4. Browser automatically includes the cookie on every subsequent request
5. Server looks up the session ID to identify the user

### When to use it

Session-based auth is a strong default for server-rendered web applications. It is simple to implement, easy to revoke (just delete the session), and the browser handles cookie management automatically.

### Trade-offs

| Advantage | Disadvantage |
|---|---|
| Simple to implement and reason about | Requires server-side storage |
| Easy to revoke (delete the session) | Horizontal scaling needs shared session store |
| Browser handles cookies automatically | Not ideal for mobile apps or third-party APIs |
| No sensitive data exposed to the client | Vulnerable to CSRF without proper protections |

If you are building a traditional web application with server-side rendering, sessions are probably the right choice. The added complexity of JWTs is unnecessary for most monolithic applications.

### Security essentials

- Set cookies to `HttpOnly`, `Secure`, and `SameSite=Strict` (or `Lax` for cross-site navigation)
- Regenerate the session ID after login to prevent session fixation attacks
- Set a reasonable expiry time and implement idle timeouts
- Store sessions in a persistent store (Redis, database) rather than in-memory for production

## Token-Based Authentication (JWTs)

JSON Web Tokens (JWTs) are the dominant pattern for API authentication. Instead of storing session state on the server, the server issues a signed token that contains the user's identity and claims. The client includes this token in subsequent requests, and the server validates it by checking the signature.

### How it works

1. User submits credentials
2. Server validates credentials and creates a signed JWT containing user claims
3. Server returns the JWT to the client
4. Client stores the token and includes it in the `Authorization` header on each request
5. Server validates the token signature and reads the claims without any database lookup

The <a href="https://jwt.io/" target="_blank" rel="noopener noreferrer">JWT.io ↗</a> debugger is a useful tool for inspecting token contents during development.

### When to use it

JWTs shine in stateless architectures, microservices, and scenarios where the API serves multiple client types (web, mobile, third-party integrations). Because the server does not need to look up a session, each request is self-contained.

### Trade-offs

| Advantage | Disadvantage |
|---|---|
| Stateless: no server-side session store needed | Cannot be revoked without additional infrastructure |
| Works well across services and domains | Token size grows with claims |
| Good for mobile and SPA clients | Must handle token refresh carefully |
| Scales horizontally without shared state | Vulnerable to XSS if stored in localStorage |

### The revocation problem

The biggest drawback of JWTs is that you cannot easily revoke them. Once issued, a JWT is valid until it expires. If a user's account is compromised, you cannot instantly invalidate their token without maintaining a blocklist, which reintroduces server-side state.

Common approaches to mitigate this:

- **Short-lived access tokens** (5 to 15 minutes) with longer-lived refresh tokens
- **Token blocklists** checked on each request (trades some statelessness for revocability)
- **Token versioning** in the database, where changing the version invalidates all existing tokens

If you want to understand how token validation fits into broader [API design](/backend/api-design-principles-every-developer-should-know), consistent error responses for expired or invalid tokens are essential.

### Security essentials

- Never store JWTs in localStorage; use HttpOnly cookies or secure in-memory storage
- Use short expiry times for access tokens
- Validate the signature, issuer, audience, and expiry on every request
- Use asymmetric signing (RS256) when tokens are validated by multiple services
- Never put sensitive data in the JWT payload; it is Base64-encoded, not encrypted

## OAuth 2.0 and OpenID Connect

<a href="https://oauth.net/2/" target="_blank" rel="noopener noreferrer">OAuth 2.0 ↗</a> is an authorisation framework that allows users to grant third-party applications limited access to their accounts without sharing their password. OpenID Connect (OIDC) is a layer on top of OAuth 2.0 that adds authentication, giving you a standardised way to verify a user's identity.

### When to use it

- **"Sign in with Google/GitHub/Microsoft"**: delegating authentication to an identity provider
- **Third-party API access**: letting other applications access your users' data with their consent
- **Single sign-on (SSO)**: one login across multiple internal applications

### The authorisation code flow

The most common and secure OAuth 2.0 flow for web applications:

1. Your app redirects the user to the identity provider (e.g. Google)
2. The user authenticates and consents to the requested permissions
3. The identity provider redirects back to your app with an authorisation code
4. Your server exchanges the code for an access token (and optionally a refresh token)
5. Your server uses the access token to fetch user information

### Common mistakes

**Using the implicit flow.** The implicit flow returns tokens directly in the URL fragment and is now considered insecure. Always use the authorisation code flow with PKCE, even for single-page applications.

**Not validating the state parameter.** The `state` parameter prevents CSRF attacks during the OAuth flow. Generate a random value before redirecting, store it in the session, and verify it matches when the user returns.

**Requesting too many scopes.** Only request the permissions you actually need. Users are more likely to trust and complete the flow when the permissions list is short and specific.

**Trusting the ID token without validation.** Always validate the token signature, issuer, audience, and expiry. Libraries like `jose` or your identity provider's SDK handle this for you.

## API Key Authentication

API keys are simple, long-lived tokens that identify the calling application rather than a specific user. They are commonly used for server-to-server communication and public APIs with rate limiting.

### When to use it

- Machine-to-machine API calls where no user context is needed
- Rate limiting and usage tracking for public APIs
- Development and testing environments where full OAuth would be overkill

### When not to use it

API keys are not suitable for authenticating end users. They do not provide user identity, cannot support MFA, and are difficult to scope to individual permissions. If a key is leaked, anyone can use it until it is rotated.

### Security essentials

- Treat API keys like passwords: never commit them to source control
- Store keys in [environment variables](/devops/environment-variables-done-right) or a secrets manager
- Support key rotation without downtime (allow multiple active keys per client)
- Log API key usage for auditing and anomaly detection
- Apply rate limiting per key to contain the blast radius of a compromised key

Proper [logging](/backend/the-developers-guide-to-logging) of authentication events, including failed attempts, is critical for detecting abuse early.

## Passkeys and WebAuthn

Passkeys are the newest authentication pattern and arguably the most secure. Built on the <a href="https://webauthn.io/" target="_blank" rel="noopener noreferrer">WebAuthn ↗</a> standard and backed by the <a href="https://fidoalliance.org/passkeys/" target="_blank" rel="noopener noreferrer">FIDO Alliance ↗</a>, passkeys replace passwords with cryptographic key pairs stored on the user's device.

### How it works

1. **Registration:** The user's device generates a public/private key pair. The public key is sent to the server. The private key stays on the device, protected by biometrics or a device PIN.
2. **Authentication:** The server sends a challenge. The device signs it with the private key (after biometric verification). The server verifies the signature with the stored public key.

The private key never leaves the device. There is no shared secret to be phished, leaked, or brute-forced.

### Why passkeys matter

- **Phishing-resistant:** The key pair is bound to the specific domain. A fake login page on a different domain cannot trigger the correct key.
- **No passwords to leak:** There is no password database to breach.
- **Better user experience:** Biometric login is faster than typing a password.
- **Cross-device sync:** Passkeys sync across devices via iCloud Keychain, Google Password Manager, or similar platform services.

### Implementation considerations

Passkeys are well supported in modern browsers and operating systems, but you need a fallback for users on older devices. The most common approach is to offer passkeys alongside traditional authentication, letting users upgrade at their own pace.

Libraries like SimpleWebAuthn (JavaScript) and py_webauthn (Python) simplify server-side implementation. The <a href="https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">OWASP Authentication Cheat Sheet ↗</a> provides comprehensive guidance on implementing any of these patterns securely.

## Multi-Factor Authentication

Multi-factor authentication (MFA) is not a standalone pattern but a layer you add on top of any of the patterns above. It requires the user to prove their identity with two or more factors from different categories:

- **Something you know:** password, PIN
- **Something you have:** phone, hardware key, authenticator app
- **Something you are:** fingerprint, face recognition

### Practical implementation

The most common MFA approach for web applications is TOTP (Time-based One-Time Passwords) using an authenticator app like Google Authenticator or Authy. The flow:

1. User enables MFA in their account settings
2. Server generates a shared secret and displays it as a QR code
3. User scans the QR code with their authenticator app
4. On subsequent logins, the user enters the six-digit code from their app after their password

### Avoid SMS-based MFA where possible

SMS codes are better than no MFA, but they are vulnerable to SIM swapping attacks, SS7 network exploits, and social engineering. Authenticator apps and hardware security keys are more secure alternatives.

## Choosing the Right Pattern

There is no universal best answer. The right choice depends on your architecture, your users, and your security requirements.

| Scenario | Recommended Pattern |
|---|---|
| Traditional server-rendered web app | Server-side sessions |
| SPA with API backend | JWTs (in HttpOnly cookies) + refresh tokens |
| Mobile app | JWTs with secure storage |
| Microservices (service-to-service) | JWTs with asymmetric signing |
| Third-party integrations | OAuth 2.0 |
| Public API | API keys with rate limiting |
| High-security application | Passkeys + MFA |
| "Sign in with Google" | OpenID Connect |

Many real-world applications combine patterns. A SaaS product might use OAuth 2.0 for social login, issue JWTs for API access, support passkeys for security-conscious users, and require MFA for admin accounts.

Whatever pattern you choose, handle [errors](/code-quality/effective-error-handling-patterns-for-cleaner-code) carefully in your authentication flow. Avoid leaking information in error messages (do not tell the user whether the email or the password was wrong), and log all authentication events for security auditing.

## Getting Started

If you are building a new application:

1. **Start with the simplest pattern** that meets your requirements. For most web apps, that means sessions or JWTs in HttpOnly cookies.
2. **Add MFA early.** Retrofitting it later is harder than building it in from the start.
3. **Use established libraries.** Do not implement password hashing, token signing, or cryptographic operations yourself.
4. **Plan for passkeys.** Even if you do not support them at launch, design your auth system so passkeys can be added later without a rewrite.
5. **Test your authentication thoroughly.** Include tests for expired tokens, revoked sessions, invalid credentials, and rate limiting. Authentication is too important for [tests that do not actually help](/code-quality/how-to-write-tests-that-actually-help).

Authentication is foundational. Getting it right means your users can trust your application with their data. Getting it wrong means everything else you have built is compromised.
