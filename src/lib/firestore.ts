import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import app from "./firebase";

export const db = getFirestore(app);

export type FamilyDoc = {
  ownerUid: string;
  familyName: string;
  bio: string;
  location: string;
  isPublic: boolean;
};

export type MemberDoc = {
  name: string;
  role: string;
  age: string;
  bio: string;
  isPublic: boolean;
};

export type OpportunityDoc = {
  ownerUid: string;
  familyName: string;
  title: string;
  category: string;
  description: string;
  location: string;
  schedule: string;
  rate: string;
  type: "job" | "event";
  capacity: number;
  status: "open" | "accepted" | "closed";
  acceptedByUid?: string;
};

export async function getFamily(uid: string) {
  const ref = doc(db, "families", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...(snap.data() as FamilyDoc) } : null;
}

export async function createFamilyIfMissing(uid: string) {
  const ref = doc(db, "families", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      ownerUid: uid,
      familyName: "",
      bio: "",
      location: "",
      isPublic: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function upsertFamily(uid: string, data: Partial<FamilyDoc>) {
  const ref = doc(db, "families", uid);
  await setDoc(
    ref,
    {
      ...data,
      ownerUid: uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listMembers(uid: string) {
  const ref = collection(db, "families", uid, "members");
  const snap = await getDocs(ref);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as MemberDoc),
  }));
}

export async function addMember(uid: string, data: MemberDoc) {
  const ref = collection(db, "families", uid, "members");
  await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function listPublicFamilies() {
  const ref = collection(db, "families");
  const q = query(ref, where("isPublic", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as FamilyDoc),
  }));
}

export async function createOpportunity(
  uid: string,
  data: Omit<OpportunityDoc, "ownerUid" | "status">,
) {
  const ref = collection(db, "families", uid, "opportunities");
  await addDoc(ref, {
    ...data,
    ownerUid: uid,
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listOpportunities(uid: string) {
  const ref = collection(db, "families", uid, "opportunities");
  const snap = await getDocs(ref);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as OpportunityDoc),
  }));
}

export async function listAllOpportunities() {
  const ref = collectionGroup(db, "opportunities");
  const snap = await getDocs(ref);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as OpportunityDoc),
  }));
}

export async function listPublicMembers() {
  const ref = collectionGroup(db, "members");
  const q = query(ref, limit(25));
  const snap = await getDocs(q);
  return snap.docs
    .map((docSnap) => ({
      id: docSnap.id,
      familyId: docSnap.ref.parent.parent?.id ?? "",
      ...(docSnap.data() as MemberDoc),
    }))
    .filter((member) => member.isPublic)
    .slice(0, 10);
}

export async function acceptOpportunity(
  ownerUid: string,
  opportunityId: string,
  acceptedByUid: string,
) {
  const ref = doc(db, "families", ownerUid, "opportunities", opportunityId);
  await updateDoc(ref, {
    status: "accepted",
    acceptedByUid,
    updatedAt: serverTimestamp(),
  });
}

export async function closeOpportunity(ownerUid: string, opportunityId: string) {
  const ref = doc(db, "families", ownerUid, "opportunities", opportunityId);
  await updateDoc(ref, {
    status: "closed",
    updatedAt: serverTimestamp(),
  });
}

export async function addRsvp(
  ownerUid: string,
  opportunityId: string,
  attendeeUid: string,
) {
  const ref = collection(
    db,
    "families",
    ownerUid,
    "opportunities",
    opportunityId,
    "rsvps",
  );
  await addDoc(ref, {
    attendeeUid,
    createdAt: serverTimestamp(),
  });
}

export async function countRsvps(ownerUid: string, opportunityId: string) {
  const ref = collection(
    db,
    "families",
    ownerUid,
    "opportunities",
    opportunityId,
    "rsvps",
  );
  const snap = await getDocs(ref);
  return snap.size;
}
