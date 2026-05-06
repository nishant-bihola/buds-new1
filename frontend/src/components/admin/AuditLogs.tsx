import React from "react";
import useSWR from "swr";
import { api } from "../../lib/api";
import { History, User, Activity, Clock } from "lucide-react";

export function AuditLogs() {
  const { data } = useSWR("admin-audit-logs", () => api.get("/admin/audit-logs"));
  const logs = data?.logs || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-brand-green">System Audit Logs</h2>
        <p className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest mt-1">Transparency & Compliance Tracking</p>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-brand-green/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-green/[0.02] border-b border-brand-green/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/40">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/40">Staff ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/40">Action</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/40">Target</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/40">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green/5">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-brand-green/[0.01] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-brand-green/60">
                      <Clock size={12} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-black text-brand-green uppercase tracking-wider">
                      <User size={12} className="text-brand-green/30" />
                      {log.staffId.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      log.action === "delete" ? "bg-red-50 text-red-600" :
                      log.action === "update" ? "bg-blue-50 text-blue-600" :
                      "bg-emerald-50 text-emerald-600"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[11px] font-bold text-brand-green/80 uppercase tracking-widest">
                    {log.targetType}
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-[11px] text-brand-green/60 font-medium">
                      {log.targetId ? `ID: ${log.targetId.slice(0, 12)}...` : "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
