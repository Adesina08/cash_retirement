import { FirebaseApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { Role } from '@lib/types';
import { DataClient, DataClientFactory } from './data-client';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
}

export function createFirebaseDataClient(config: FirebaseConfig): DataClient {
  const app = initializeApp(config);
  return new FirebaseDataClient(app);
}

class FirebaseDataClient implements DataClient {
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);

  constructor(private app: FirebaseApp) {}

  async currentUser() {
    const user = this.auth.currentUser;
    if (user) {
      const profileRef = doc(this.db, 'users', user.uid);
      const profile = await getDoc(profileRef);
      return { id: user.uid, ...profile.data() };
    }
    throw new Error('Not authenticated');
  }

  async listUsers(role?: Role) {
    const usersRef = collection(this.db, 'users');
    const q = role ? query(usersRef, where('role', '==', role)) : usersRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async listPolicies() {
    const snapshot = await getDocs(collection(this.db, 'policies'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async listCostCenters() {
    const snapshot = await getDocs(collection(this.db, 'costCenters'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async listGlCodes() {
    const snapshot = await getDocs(collection(this.db, 'glCodes'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async listAdvances(params?: { status?: string; employeeId?: string }) {
    const advancesRef = collection(this.db, 'advances');
    const clauses = [] as any[];
    if (params?.status) clauses.push(where('status', '==', params.status));
    if (params?.employeeId) clauses.push(where('employeeId', '==', params.employeeId));
    const q = clauses.length ? query(advancesRef, ...clauses) : advancesRef;
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getAdvance(id: string) {
    const docRef = doc(this.db, 'advances', id);
    const snapshot = await getDoc(docRef);
    const itemsSnapshot = await getDocs(collection(docRef, 'items'));
    return { id: snapshot.id, ...snapshot.data(), items: itemsSnapshot.docs.map((doc) => doc.data()) };
  }

  async createAdvance(payload: any) {
    const docRef = doc(collection(this.db, 'advances'));
    await setDoc(docRef, payload);
    return { id: docRef.id, ...payload };
  }

  async submitAdvanceForApproval(id: string) {
    await updateDoc(doc(this.db, 'advances', id), { status: 'PENDING_MANAGER' });
    return this.getAdvance(id);
  }

  async approveAdvance(id: string, payload: any) {
    await updateDoc(doc(this.db, 'advances', id), { status: payload.approve ? 'APPROVED' : 'REJECTED' });
    return this.getAdvance(id);
  }

  async recordDisbursement(id: string, payload: any) {
    await updateDoc(doc(this.db, 'advances', id), {
      status: 'DISBURSED',
      disbursementRef: payload.ref,
      disbursedAt: payload.date
    });
    return this.getAdvance(id);
  }

  async submitRetirement(id: string, payload: any) {
    await updateDoc(doc(this.db, 'advances', id), { status: 'UNDER_REVIEW' });
    const retirementRef = doc(collection(this.db, 'retirements'));
    await setDoc(retirementRef, { advanceId: id, ...payload });
    return { id: retirementRef.id, advanceId: id, ...payload };
  }

  async verifyRetirement(id: string, payload: any) {
    await updateDoc(doc(this.db, 'advances', id), { status: payload.approve ? 'SETTLED' : 'UNDER_REVIEW' });
    return this.getAdvance(id);
  }

  async listAuditLogs(entityId: string, entityType: string) {
    const snapshot = await getDocs(
      query(collection(this.db, 'auditLogs'), where('entityId', '==', entityId), where('entityType', '==', entityType))
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async listPayments(advanceId: string) {
    const snapshot = await getDocs(query(collection(this.db, 'payments'), where('advanceId', '==', advanceId)));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async recordPayment(advanceId: string, payment: any) {
    const paymentRef = doc(collection(this.db, 'payments'));
    await setDoc(paymentRef, { advanceId, ...payment });
    return { id: paymentRef.id, advanceId, ...payment };
  }

  async getFinanceDashboard() {
    throw new Error('Not implemented in Firebase demo');
  }

  async exportAdvances() {
    throw new Error('Not implemented in Firebase demo');
  }
}

export const createFirebaseClientFactory = (config: FirebaseConfig): DataClientFactory => () =>
  createFirebaseDataClient(config);
