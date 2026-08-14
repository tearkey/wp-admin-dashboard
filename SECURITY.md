# Security Policy

Techtrick CMS is maintained by [Techtrick Technologies](https://www.techtrick.com.bd).
We take security reports seriously and appreciate responsible disclosure.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
| < 1.0   | No        |

Only the latest release on the `main` branch receives security fixes.

## Reporting a vulnerability

**Do not open a public GitHub issue for security problems.**

Report privately using either channel:

1. Email [hello@techtrick.com.bd](mailto:hello@techtrick.com.bd) with the subject
   prefix `[SECURITY]`.
2. Open a GitHub private security advisory on the repository
   (Security → Report a vulnerability).

### What to include

- Affected version or commit SHA
- Environment (browser, Node version, deployment target)
- Step-by-step reproduction instructions
- Impact assessment — what an attacker can read, change, or break
- A proof of concept, patch, or log excerpt if you have one

## Our response

| Stage                                     | Target          |
| ----------------------------------------- | --------------- |
| Acknowledge your report                   | 3 business days |
| Triage and severity assessment            | 7 days          |
| Fix released or mitigation plan published | 30 days         |

We will keep you updated as the work progresses and credit you in the release
notes unless you ask to stay anonymous.

## Coordinated disclosure

Please give us the timeline above before publishing details. If a fix takes
longer, we will agree on a disclosure date with you. We will never take legal
action against researchers who follow this policy, act in good faith, avoid
privacy violations and service disruption, and do not exfiltrate data.

## Out of scope

Techtrick CMS ships as a front-end admin dashboard with mock data and no backend.
The following are not vulnerabilities in this project:

- Absence of authentication, authorization, or rate limiting — none is implemented yet
- Data exposure from `src/data/cms-mock.ts` (sample content only)
- Issues that only exist in your own fork's backend or data layer
- Missing security headers on a deployment you control (configure them on your host)
- Automated scanner output with no demonstrated impact
- Vulnerabilities in third-party dependencies with no exploit path here — report
  those upstream, though we welcome a heads-up

## Contact

- Email: [hello@techtrick.com.bd](mailto:hello@techtrick.com.bd)
- Website: [www.techtrick.com.bd](https://www.techtrick.com.bd)
