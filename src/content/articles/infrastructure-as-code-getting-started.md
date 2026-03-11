---
title: "Infrastructure as Code: Getting Started"
description: "Get started with infrastructure as code using Terraform, Pulumi, and AWS CDK to automate and version your cloud infrastructure."
publishDate: "2026-02-05"
author: "jonny-rowse"
category: "devops"
tags: ["infrastructure-as-code", "terraform", "devops", "cloud"]
featured: false
draft: false
faqs:
  - question: "What is infrastructure as code and why does it matter?"
    answer: "Infrastructure as code (IaC) is the practice of defining and managing your cloud infrastructure (servers, databases, networks, etc.) using configuration files rather than manual processes. It matters because it makes infrastructure reproducible, version-controlled, and reviewable. If a server is misconfigured, you can see exactly when and why the change was made, just like you would with application code."
  - question: "Should I start with Terraform or Pulumi?"
    answer: "Terraform is the safer choice for most teams because of its massive ecosystem, extensive documentation, and large community. If your team is strongly opinionated about using a general-purpose programming language instead of HCL, Pulumi is an excellent alternative that lets you write infrastructure in TypeScript, Python, Go, or C#. Both are production-ready and well-supported."
  - question: "Can I use infrastructure as code with an existing manually created infrastructure?"
    answer: "Yes. Most IaC tools support importing existing resources. Terraform has a terraform import command, and Pulumi has pulumi import. The process can be tedious for large environments, but it is worth the investment. Once your resources are managed by IaC, you gain all the benefits of version control and automated deployments going forward."
  - question: "How do I manage secrets in infrastructure as code?"
    answer: "Never commit secrets to your IaC repository in plain text. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault) and reference secrets by their identifier in your IaC code. For Terraform state files, which may contain sensitive values, use encrypted remote backends like S3 with server-side encryption enabled."
  - question: "What is the difference between Terraform and CloudFormation?"
    answer: "CloudFormation is AWS-specific and tightly integrated with AWS services. Terraform is cloud-agnostic and supports AWS, Azure, GCP, and hundreds of other providers through a plugin system. If you are exclusively on AWS and want deep integration, CloudFormation works well. If you use multiple cloud providers or want transferable skills, Terraform is the better choice."
primaryKeyword: "infrastructure as code getting started"
---

Click through a cloud console to create a server and you have infrastructure. Write a configuration file that creates the same server and you have infrastructure as code. The difference sounds minor, but it fundamentally changes how you build, manage, and reason about your systems.

Infrastructure as code (IaC) brings the same rigour to your servers, databases, and networks that version control brought to your application code. It is one of the most impactful practices a development team can adopt, and getting started is more straightforward than you might expect. Having introduced IaC to multiple teams over the years, I can confirm that the initial learning curve pays for itself within the first month. According to the <a href="https://puppet.com/resources/state-of-devops-report" target="_blank" rel="noopener noreferrer">Puppet State of DevOps Report ↗</a>, teams that adopt IaC deploy 208 times more frequently than those relying on manual processes, with 106 times faster lead times from commit to deploy.

## Why Manual Infrastructure Fails at Scale

Manual infrastructure works when you have one server and one developer. It breaks down quickly beyond that.

The first problem is reproducibility. If your production server was configured through a series of console clicks over six months, can you recreate it exactly? What about creating an identical staging environment? With manual infrastructure, the answer is usually "no, not exactly."

The second problem is documentation. Console changes leave no audit trail of why a configuration was changed. When something breaks, you are left guessing which of the dozens of recent changes caused the issue.

The third problem is collaboration. Two people cannot click buttons in the same console simultaneously without risking conflicts. There is no review process, no approval workflow, and no way to test changes before applying them.

IaC solves all three problems by treating infrastructure definitions as source code: versioned, reviewed, tested, and deployed through automated pipelines.

| Challenge | Manual Infrastructure | Infrastructure as Code |
|-----------|----------------------|----------------------|
| Reproducibility | Error-prone, undocumented | Deterministic, version-controlled |
| Collaboration | Conflicting console changes | Pull requests with peer review |
| Audit trail | None or minimal | Full git history with reasoning |
| Disaster recovery | Hours or days to rebuild | Minutes to redeploy |
| Environment parity | Drift between environments | Identical by definition |
| Onboarding | Tribal knowledge | Read the codebase |

## The IaC Landscape

| Tool | Language | Multi-Cloud | Key Strength | Best For |
|------|----------|-------------|-------------|----------|
| Terraform | HCL | Yes | Massive ecosystem, community | Most teams, multi-cloud |
| Pulumi | TS, Python, Go, C# | Yes | General-purpose language | Teams who prefer real code |
| AWS CDK | TS, Python, Java, Go | AWS only | Deep AWS integration | AWS-only shops |
| CloudFormation | JSON/YAML | AWS only | Native AWS, no state file | Simple AWS setups |
| Bicep | Bicep DSL | Azure only | Clean syntax for ARM | Azure-focused teams |

### Terraform

Terraform by HashiCorp is the most widely adopted IaC tool. It uses a declarative language called HCL (HashiCorp Configuration Language) where you describe the desired state of your infrastructure, and Terraform figures out how to get there.

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = "production"
  }
}
```

Terraform supports virtually every cloud provider through its plugin system. AWS, Azure, GCP, Cloudflare, Datadog, GitHub, and hundreds more all have official or community-maintained providers. The <a href="https://developer.hashicorp.com/terraform/docs" target="_blank" rel="noopener noreferrer">Terraform documentation ↗</a> is comprehensive and includes tutorials for every major cloud provider.

### Pulumi

Pulumi takes a different approach. Instead of a domain-specific language, you write infrastructure using general-purpose programming languages: TypeScript, Python, Go, or C#.

```typescript
import * as aws from "@pulumi/aws";

const server = new aws.ec2.Instance("web", {
  ami: "ami-0c55b159cbfafe1f0",
  instanceType: "t3.micro",
  tags: {
    Name: "web-server",
    Environment: "production",
  },
});
```

The advantage is that you get the full power of your programming language: loops, conditionals, functions, type checking, and your existing IDE tooling. The trade-off is a steeper learning curve for the infrastructure concepts, since you are mixing them with application code patterns.

### AWS CDK

The AWS Cloud Development Kit is AWS's answer to Pulumi, specifically for AWS infrastructure. It compiles down to CloudFormation templates and supports TypeScript, Python, Java, Go, and C#.

CDK is an excellent choice if your infrastructure is entirely on AWS and you want tight integration with AWS services. It is less suitable if you need multi-cloud support.

## Core Concepts

### State

IaC tools maintain a state file that maps your configuration to real-world resources. When you run `terraform plan`, Terraform compares your configuration to the state file and to the actual infrastructure to determine what changes are needed.

State must be stored securely and shared across your team. For Terraform, use a remote backend like an S3 bucket with DynamoDB locking. For Pulumi, the managed Pulumi Cloud service handles state storage automatically.

Never store state files in your git repository. They can contain sensitive information (database passwords, API keys) and will cause merge conflicts.

### Plan and Apply

The plan-and-apply workflow is a safety net. Before making any changes, the tool shows you exactly what it will create, modify, or destroy. You review the plan and explicitly approve it.

```bash
terraform plan
# Review the output carefully
terraform apply
```

This two-step process prevents accidental deletions, unexpected modifications, and the kind of "I didn't realise that would happen" moments that are common with manual infrastructure changes. In my experience, the plan step has saved teams from catastrophic mistakes more times than I can count. On one occasion, a `terraform plan` revealed that a seemingly harmless network change would have destroyed and recreated the production database, which would have meant total data loss.

### Modules

As your infrastructure grows, you will notice repeated patterns. A load balancer, an auto-scaling group, and a target group always appear together. A database always has a subnet group, a parameter group, and a security group.

Modules let you encapsulate these patterns into reusable components.

```hcl
module "web_cluster" {
  source        = "./modules/web-cluster"
  instance_type = "t3.small"
  min_size      = 2
  max_size      = 10
  environment   = "production"
}
```

Well-designed modules are the key to maintaining large IaC codebases. They reduce duplication, enforce standards, and make it possible for developers to provision infrastructure without understanding every low-level detail.

## Getting Started: A Practical Path

### Step 1: Start Small

Do not try to codify your entire infrastructure at once. Pick one isolated resource, such as an S3 bucket, a DNS record, or a simple Lambda function, and write the IaC for it. Get comfortable with the workflow: write, plan, apply, verify.

### Step 2: Set Up Remote State

Before anyone else on your team starts using IaC, configure remote state storage. For Terraform on AWS, this means an S3 bucket for state and a DynamoDB table for locking.

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

### Step 3: Organise Your Code

Structure your IaC repository by environment and service. A common pattern is:

```
infrastructure/
  modules/
    web-cluster/
    database/
    networking/
  environments/
    production/
      main.tf
      variables.tf
      outputs.tf
    staging/
      main.tf
      variables.tf
      outputs.tf
```

Each environment references shared modules with environment-specific variables. This ensures production and staging are structurally identical while allowing different instance sizes, replica counts, and other configuration.

### Step 4: Add to CI/CD

Integrate IaC into your deployment pipeline. A typical workflow is:

1. Developer creates a pull request with infrastructure changes.
2. CI runs `terraform plan` and posts the output as a PR comment.
3. A reviewer approves the plan.
4. On merge, CD runs `terraform apply` to enact the changes.

This gives you the same review process for infrastructure changes that you have for application code. If you do not already have a pipeline set up, our guide on [how to build a CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) covers the foundations. Writing clear [commit messages](/workflows/the-art-of-writing-good-commit-messages) for infrastructure changes is especially important, since a bad IaC commit can have far-reaching consequences.

<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" aria-label="Flowchart showing the infrastructure as code workflow from code change to production deployment">
  <style>
    .iac-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; fill: #334155; }
    .iac-label { font-family: 'Inter', sans-serif; font-size: 10px; fill: #334155; }
    .iac-sublabel { font-family: 'Inter', sans-serif; font-size: 9px; fill: #64748b; }
    .iac-box { rx: 8; ry: 8; }
  </style>
  <text x="300" y="20" text-anchor="middle" class="iac-title">IaC Deployment Workflow</text>
  <rect x="10" y="50" width="90" height="55" class="iac-box" fill="#e0f2fe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="55" y="72" text-anchor="middle" class="iac-label">Edit .tf</text>
  <text x="55" y="88" text-anchor="middle" class="iac-sublabel">Code change</text>
  <line x1="100" y1="78" x2="130" y2="78" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#iac-arrow)"/>
  <rect x="130" y="50" width="90" height="55" class="iac-box" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="175" y="72" text-anchor="middle" class="iac-label">Open PR</text>
  <text x="175" y="88" text-anchor="middle" class="iac-sublabel">Version control</text>
  <line x1="220" y1="78" x2="250" y2="78" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#iac-arrow)"/>
  <rect x="250" y="50" width="90" height="55" class="iac-box" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="295" y="72" text-anchor="middle" class="iac-label">CI: Plan</text>
  <text x="295" y="88" text-anchor="middle" class="iac-sublabel">terraform plan</text>
  <line x1="340" y1="78" x2="370" y2="78" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#iac-arrow)"/>
  <rect x="370" y="50" width="90" height="55" class="iac-box" fill="#e0f2fe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="415" y="72" text-anchor="middle" class="iac-label">Review</text>
  <text x="415" y="88" text-anchor="middle" class="iac-sublabel">Team approval</text>
  <line x1="460" y1="78" x2="490" y2="78" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#iac-arrow)"/>
  <rect x="490" y="50" width="100" height="55" class="iac-box" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
  <text x="540" y="72" text-anchor="middle" class="iac-label">CD: Apply</text>
  <text x="540" y="88" text-anchor="middle" class="iac-sublabel">terraform apply</text>
  <text x="300" y="150" text-anchor="middle" class="iac-sublabel">Infrastructure changes follow the same review process as application code</text>
  <defs>
    <marker id="iac-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>

## Common Pitfalls

**Modifying resources outside of IaC.** If someone changes a security group through the console, Terraform's state becomes out of sync. The next apply may undo the manual change or fail entirely. Enforce a policy: all infrastructure changes go through IaC.

**Overly large state files.** Putting everything in a single state file creates a bottleneck. Split your infrastructure into separate state files by service or domain. Terraform workspaces or separate root modules both work.

**Ignoring drift detection.** Resources can change outside your IaC (manual changes, AWS service updates). Run `terraform plan` regularly, even when you have not made changes, to detect and reconcile drift. Setting this up as part of your [observability practice](/devops/observability-vs-monitoring-what-developers-need-to-know) helps catch drift early.

**Skipping the review process.** Applying infrastructure changes without peer review is as risky as merging code without a review. Always use pull requests for IaC changes, just as you would for [application code reviews](/collaboration/code-reviews-that-dont-waste-time).

## The Payoff

Once your infrastructure is defined as code, you gain capabilities that are impossible with manual management. Creating a complete copy of your production environment for testing takes minutes instead of days. Disaster recovery becomes a `terraform apply` in a different region. New team members can understand your entire infrastructure by reading the codebase.

The initial investment is real, but it pays for itself many times over as your systems grow. Combined with [Docker for containerisation](/devops/docker-for-developers-beyond-the-basics) and [feature flags for safe rollouts](/devops/feature-flags-a-practical-introduction), IaC forms one pillar of a modern, reliable DevOps practice.

For further reading, the <a href="https://developer.hashicorp.com/terraform/tutorials" target="_blank" rel="noopener noreferrer">HashiCorp Terraform tutorials ↗</a> provide hands-on exercises that walk you through real-world scenarios step by step.
