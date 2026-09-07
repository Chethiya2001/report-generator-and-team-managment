import { create } from 'zustand';
import type { Report, ReportStatus } from '../types';
import { api, getToken } from '../services/api';

type ReportInput = Omit<Report, 'id'|'createdAt'|'updatedAt'|'reviews'|'versions'>;
interface ReportState { reports: Report[]; isInitialized: boolean; initialize: () => Promise<void>; createReport: (r: ReportInput) => Promise<string>; updateReport: (id:string,u:Partial<Report>)=>Promise<void>; submitReport:(id:string)=>Promise<void>; approveReport:(id:string,reviewerId:string)=>Promise<void>; requestCorrection:(id:string,reviewerId:string,comment:string)=>Promise<void>; }
const payload=(r:Partial<Report>)=>({...r,projectId:Number(r.projectId)});
export const useReportStore=create<ReportState>((set,get)=>({
  reports:[],isInitialized:false,
  initialize:async()=>{if(!getToken()){set({isInitialized:true});return;}try{const data=await api<{items:Report[]}>('/reports?pageSize=100');set({reports:data.items,isInitialized:true});}catch{set({reports:[],isInitialized:true});}},
  createReport:async(r)=>{const created=await api<Report>('/reports',{method:'POST',body:JSON.stringify(payload(r))});set(s=>({reports:[created,...s.reports]}));return created.id;},
  updateReport:async(id,u)=>{const current=get().reports.find(r=>r.id===id);if(!current)throw new Error('Report not found');const updated=await api<Report>(`/reports/${id}`,{method:'PUT',body:JSON.stringify(payload({...current,...u}))});set(s=>({reports:s.reports.map(r=>r.id===id?updated:r)}));},
  submitReport:async(id)=>{await api(`/reports/${id}/submit`,{method:'POST'});set(s=>({reports:s.reports.map(r=>r.id===id?{...r,status:'Submitted' as ReportStatus}:r)}));},
  approveReport:async(id,_reviewerId)=>{await api(`/reports/${id}/review`,{method:'POST',body:JSON.stringify({action:'Approved',comment:''})});set(s=>({reports:s.reports.map(r=>r.id===id?{...r,status:'Approved' as ReportStatus}:r)}));},
  requestCorrection:async(id,_reviewerId,comment)=>{await api(`/reports/${id}/review`,{method:'POST',body:JSON.stringify({action:'Needs Correction',comment})});set(s=>({reports:s.reports.map(r=>r.id===id?{...r,status:'Needs Correction' as ReportStatus}:r)}));},
}));
