import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo123", 10);

  const users = [
    { email: "admin@demo.com", name: "Dr. Anna Weber", role: "ADMIN" },
    { email: "supervisor@demo.com", name: "Thomas Richter", role: "SUPERVISOR" },
    { email: "caseworker@demo.com", name: "Lisa Müller", role: "CASEWORKER" },
    { email: "readonly@demo.com", name: "Max Hoffmann", role: "READ_ONLY" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { ...u, password },
    });
  }

  const allUsers = await prisma.user.findMany();
  const admin = allUsers.find(u => u.role === "ADMIN")!;
  const supervisor = allUsers.find(u => u.role === "SUPERVISOR")!;
  const caseworker = allUsers.find(u => u.role === "CASEWORKER")!;

  const existing = await prisma.claim.count();
  if (existing > 0) {
    console.log("Seed skipped — claims already exist.");
    return;
  }

  const claimsData = [
    {
      claimantName: "Marta Nowak",
      policyNumber: "AOK-10293",
      claimType: "HOSPITAL",
      icdCode: "S72.0",
      dateOfService: new Date("2026-01-15"),
      amountClaimed: 4850.0,
      description: "Emergency admission — femoral neck fracture after fall. Surgical intervention required.",
      status: "NEW",
      priority: "HIGH",
      assignedToId: supervisor.id,
    },
    {
      claimantName: "Paul Schneider",
      policyNumber: "TK-88301",
      claimType: "DENTAL",
      icdCode: "K02.1",
      dateOfService: new Date("2026-02-03"),
      amountClaimed: 1200.5,
      description: "Root canal treatment on upper molar, including ceramic crown.",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      assignedToId: caseworker.id,
    },
    {
      claimantName: "Lea Wagner",
      policyNumber: "BARMER-44120",
      claimType: "THERAPY",
      icdCode: "M54.5",
      dateOfService: new Date("2026-01-28"),
      amountClaimed: 680.0,
      description: "Physiotherapy series — 10 sessions for chronic lower back pain.",
      status: "NEEDS_INFO",
      priority: "LOW",
      assignedToId: caseworker.id,
    },
    {
      claimantName: "Jonas Fischer",
      policyNumber: "DAK-77542",
      claimType: "PRESCRIPTION",
      icdCode: "J45.0",
      dateOfService: new Date("2026-02-10"),
      amountClaimed: 245.9,
      description: "Monthly asthma medication — Symbicort Turbohaler 160/4.5.",
      status: "APPROVED",
      priority: "LOW",
      assignedToId: supervisor.id,
    },
    {
      claimantName: "Sophie Becker",
      policyNumber: "AOK-23456",
      claimType: "HOSPITAL",
      icdCode: "O80",
      dateOfService: new Date("2026-02-01"),
      amountClaimed: 3200.0,
      description: "Planned hospital delivery — normal birth with 3-day postpartum stay.",
      status: "APPROVED",
      priority: "MEDIUM",
      assignedToId: supervisor.id,
    },
    {
      claimantName: "Michael Braun",
      policyNumber: "TK-91024",
      claimType: "REHABILITATION",
      icdCode: "I25.1",
      dateOfService: new Date("2025-12-15"),
      amountClaimed: 8500.0,
      description: "Cardiac rehabilitation program — 3 weeks inpatient after myocardial infarction.",
      status: "REJECTED",
      priority: "HIGH",
      assignedToId: supervisor.id,
    },
    {
      claimantName: "Emma Klein",
      policyNumber: "BARMER-55789",
      claimType: "DENTAL",
      icdCode: "K08.1",
      dateOfService: new Date("2026-02-18"),
      amountClaimed: 2100.0,
      description: "Dental implant on lower jaw — titanium post with ceramic crown.",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      assignedToId: caseworker.id,
    },
    {
      claimantName: "Lukas Schäfer",
      policyNumber: "DAK-33210",
      claimType: "THERAPY",
      icdCode: "F32.1",
      dateOfService: new Date("2026-01-10"),
      amountClaimed: 1920.0,
      description: "Psychotherapy — 24 sessions of cognitive behavioral therapy for moderate depression.",
      status: "NEW",
      priority: "HIGH",
      assignedToId: null,
    },
    {
      claimantName: "Hannah Meyer",
      policyNumber: "AOK-67890",
      claimType: "GENERAL",
      icdCode: null,
      dateOfService: new Date("2026-02-20"),
      amountClaimed: 150.0,
      description: "Annual preventive health screening and blood panel.",
      status: "CLOSED",
      priority: "LOW",
      assignedToId: caseworker.id,
    },
    {
      claimantName: "Felix Wolf",
      policyNumber: "TK-45678",
      claimType: "PRESCRIPTION",
      icdCode: "E11.9",
      dateOfService: new Date("2026-02-25"),
      amountClaimed: 380.0,
      description: "Quarterly diabetes medication — Metformin 1000mg + Insulin Lantus.",
      status: "NEW",
      priority: "MEDIUM",
      assignedToId: null,
    },
    {
      claimantName: "Clara Hoffmann",
      policyNumber: "BARMER-98765",
      claimType: "HOSPITAL",
      icdCode: "K35.8",
      dateOfService: new Date("2026-02-12"),
      amountClaimed: 5600.0,
      description: "Emergency appendectomy — laparoscopic procedure with 2-day recovery stay.",
      status: "IN_REVIEW",
      priority: "HIGH",
      assignedToId: caseworker.id,
    },
    {
      claimantName: "David Krause",
      policyNumber: "DAK-12345",
      claimType: "REHABILITATION",
      icdCode: "M16.1",
      dateOfService: new Date("2026-01-20"),
      amountClaimed: 6200.0,
      description: "Post-operative rehabilitation after hip replacement — 2 weeks inpatient.",
      status: "NEEDS_INFO",
      priority: "MEDIUM",
      assignedToId: supervisor.id,
    },
  ];

  for (const c of claimsData) {
    const claim = await prisma.claim.create({ data: c as any });

    await prisma.claimAttachment.create({
      data: {
        claimId: claim.id,
        filename: `${claim.claimType.toLowerCase()}_request_${claim.policyNumber}.pdf`,
        mimeType: "application/pdf",
        size: Math.floor(Math.random() * 500000) + 100000,
      },
    });

    await prisma.auditEvent.create({
      data: {
        claimId: claim.id,
        actorId: admin.id,
        type: "CLAIM_CREATED",
        metadata: { policyNumber: claim.policyNumber, claimType: claim.claimType },
      },
    });

    if (claim.assignedToId) {
      await prisma.auditEvent.create({
        data: {
          claimId: claim.id,
          actorId: supervisor.id,
          type: "ASSIGNED",
          metadata: { assignedToId: claim.assignedToId },
        },
      });
    }

    if (claim.status !== "NEW") {
      await prisma.auditEvent.create({
        data: {
          claimId: claim.id,
          actorId: supervisor.id,
          type: "STATUS_CHANGED",
          metadata: { from: "NEW", to: claim.status === "CLOSED" ? "APPROVED" : claim.status },
        },
      });

      if (claim.status === "CLOSED") {
        await prisma.auditEvent.create({
          data: {
            claimId: claim.id,
            actorId: supervisor.id,
            type: "STATUS_CHANGED",
            metadata: { from: "APPROVED", to: "CLOSED" },
          },
        });
      }
    }
  }

  const claims = await prisma.claim.findMany();

  const notes = [
    { idx: 0, text: "High priority — patient still hospitalized. Need surgery report ASAP.", authorId: supervisor.id },
    { idx: 0, text: "Requested surgery documentation from hospital. Expected within 48h.", authorId: caseworker.id },
    { idx: 1, text: "Cost estimate reviewed. Waiting for X-ray images from dentist.", authorId: caseworker.id },
    { idx: 1, text: "X-ray images received. Forwarded to medical reviewer.", authorId: caseworker.id },
    { idx: 2, text: "Missing doctor's referral for physiotherapy sessions.", authorId: caseworker.id },
    { idx: 2, text: "Sent information request to insured person via postal mail.", authorId: caseworker.id },
    { idx: 3, text: "All documentation complete. Approved per standard tariff.", authorId: supervisor.id },
    { idx: 5, text: "Rehabilitation program not covered under current policy tier. Rejection letter sent.", authorId: supervisor.id },
    { idx: 6, text: "Implant cost exceeds standard rate. Checking for supplementary coverage.", authorId: caseworker.id },
    { idx: 7, text: "Unassigned — needs triage. Therapy approval requires supervisor review.", authorId: admin.id },
    { idx: 10, text: "Emergency case — fast-tracking review. Lab results attached.", authorId: caseworker.id },
    { idx: 11, text: "Need post-operative assessment from rehabilitation clinic.", authorId: supervisor.id },
  ];

  for (const n of notes) {
    if (claims[n.idx]) {
      await prisma.claimNote.create({
        data: { claimId: claims[n.idx].id, authorId: n.authorId, text: n.text },
      });
      await prisma.auditEvent.create({
        data: {
          claimId: claims[n.idx].id,
          actorId: n.authorId,
          type: "NOTE_ADDED",
          metadata: {},
        },
      });
    }
  }

  const pastDue = new Date();
  pastDue.setDate(pastDue.getDate() - 3);
  const futureDue = new Date();
  futureDue.setDate(futureDue.getDate() + 5);

  const tasks = [
    { idx: 0, type: "REVIEW", title: "Review surgery documentation", dueDate: futureDue, assignedToId: caseworker.id, status: "OPEN" },
    { idx: 2, type: "REQUEST_INFO", title: "Awaiting doctor referral from patient", dueDate: pastDue, assignedToId: caseworker.id, status: "OPEN" },
    { idx: 2, type: "FOLLOW_UP", title: "Follow up with patient if no response in 7 days", dueDate: futureDue, assignedToId: caseworker.id, status: "OPEN" },
    { idx: 6, type: "DOCUMENT_REQUIRED", title: "Request supplementary insurance verification", dueDate: futureDue, assignedToId: caseworker.id, status: "OPEN" },
    { idx: 10, type: "REVIEW", title: "Fast-track medical review for emergency appendectomy", dueDate: pastDue, assignedToId: supervisor.id, status: "OPEN" },
    { idx: 11, type: "REQUEST_INFO", title: "Post-operative assessment from rehab clinic", dueDate: futureDue, assignedToId: supervisor.id, status: "OPEN" },
    { idx: 3, type: "REVIEW", title: "Final review before payout", dueDate: null, assignedToId: supervisor.id, status: "CLOSED" },
    { idx: 8, type: "REVIEW", title: "Standard screening — routine approval", dueDate: null, assignedToId: caseworker.id, status: "CLOSED" },
  ];

  for (const t of tasks) {
    if (claims[t.idx]) {
      await prisma.task.create({
        data: {
          claimId: claims[t.idx].id,
          type: t.type,
          title: t.title,
          dueDate: t.dueDate,
          assignedToId: t.assignedToId,
          status: t.status,
        },
      });
    }
  }

  console.log(`Seeded: ${users.length} users, ${claimsData.length} claims, ${notes.length} notes, ${tasks.length} tasks`);
}

main().finally(() => prisma.$disconnect());
