import React from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

interface ReportCardItem {
  id: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  badge?: string;
}

const reports: ReportCardItem[] = [
  {
    id: "attendance-summary",
    title: "Báo cáo chấm công",
    description: "Tổng hợp chấm công theo tháng, tỷ lệ đi trễ, vắng mặt, WFH và xác nhận GPS/WiFi.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    badge: "Hàng tháng",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "payroll-report",
    title: "Báo cáo bảng lương",
    description: "Chi tiết lương cơ bản, phụ cấp, OT, khấu trừ bảo hiểm và thực nhận theo kỳ.",
    color: "text-green-600",
    bgColor: "bg-green-50",
    badge: "Hàng tháng",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "leave-report",
    title: "Báo cáo nghỉ phép",
    description: "Tổng hợp số ngày phép đã dùng, còn lại theo nhân viên và phòng ban trong năm.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    badge: "Hàng năm",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "overtime-report",
    title: "Báo cáo OT",
    description: "Tổng hợp giờ OT, chi phí OT theo nhân viên và phòng ban. Bao gồm tỷ lệ OT x1.5.",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    badge: "Hàng tháng",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "headcount-report",
    title: "Báo cáo nhân sự",
    description: "Thống kê số lượng nhân viên, biến động nhân sự (onboarding/offboarding) theo phòng ban.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    badge: "Hàng quý",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "insurance-report",
    title: "Báo cáo bảo hiểm",
    description: "Tổng hợp mức đóng bảo hiểm xã hội, y tế, thất nghiệp của toàn công ty theo tháng.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    badge: "Hàng tháng",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function ReportsPage() {
  return (
    <>
      <Header
        title="Báo cáo"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Báo cáo" }]}
      />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Báo cáo & Thống kê</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn loại báo cáo để xuất dữ liệu. Hỗ trợ xuất Excel và PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="group cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${report.bgColor} ${report.color}`}>
                    {report.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-800 group-hover:text-[#22C55E] transition-colors">
                        {report.title}
                      </h3>
                      {report.badge && (
                        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {report.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Excel
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF
                  </button>
                  <button className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#22C55E]/10 px-3 py-1.5 text-xs font-medium text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors">
                    Xem báo cáo
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
