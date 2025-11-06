import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ScheduleData {
  schedules: any[];
  members: any[];
  startDate: Date;
  endDate: Date;
}

export function exportScheduleToPDF(data: ScheduleData) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Team Schedule', 14, 22);
  
  doc.setFontSize(10);
  doc.text(
    `${format(data.startDate, 'MMM d, yyyy')} - ${format(data.endDate, 'MMM d, yyyy')}`,
    14,
    30
  );

  // Prepare table data
  const tableData: any[] = [];
  
  data.schedules.forEach((schedule: any) => {
    const memberName = data.members.find((m: any) => m.user_id === schedule.user_id)
      ?.profiles?.full_name || 'Unassigned';
    
    if (schedule.assignments && schedule.assignments.length > 0) {
      schedule.assignments.forEach((assignment: any) => {
        tableData.push([
          format(new Date(schedule.date), 'MMM d, yyyy'),
          memberName,
          assignment.projects?.name || 'Untitled',
          assignment.projects?.job_type || '-',
          `${assignment.start_time?.substring(0, 5)} - ${assignment.end_time?.substring(0, 5)}`,
          assignment.notes || '-',
        ]);
      });
    } else {
      tableData.push([
        format(new Date(schedule.date), 'MMM d, yyyy'),
        memberName,
        'No assignments',
        '-',
        '-',
        '-',
      ]);
    }
  });

  // Generate table
  autoTable(doc, {
    startY: 35,
    head: [['Date', 'Team Member', 'Job', 'Type', 'Time', 'Notes']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount} - Generated ${format(new Date(), 'MMM d, yyyy HH:mm')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Save
  doc.save(`schedule-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportScheduleToICalendar(data: ScheduleData, organizationName: string) {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Schedule Manager//EN',
    `X-WR-CALNAME:${organizationName} - Team Schedule`,
    'X-WR-TIMEZONE:America/New_York',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  data.schedules.forEach((schedule: any) => {
    if (!schedule.assignments || schedule.assignments.length === 0) return;

    schedule.assignments.forEach((assignment: any) => {
      const startDateTime = new Date(`${schedule.date}T${assignment.start_time}`);
      const endDateTime = new Date(`${schedule.date}T${assignment.end_time}`);
      
      const memberName = data.members.find((m: any) => m.user_id === schedule.user_id)
        ?.profiles?.full_name || 'Unassigned';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${assignment.id}@schedulemanager`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(startDateTime)}`,
        `DTEND:${formatICalDate(endDateTime)}`,
        `SUMMARY:${assignment.projects?.name || 'Untitled Job'}`,
        `DESCRIPTION:Type: ${assignment.projects?.job_type}\\nAssigned to: ${memberName}${
          assignment.notes ? `\\nNotes: ${assignment.notes}` : ''
        }`,
        `LOCATION:${assignment.projects?.address || ''}`,
        `STATUS:CONFIRMED`,
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${assignment.projects?.name}`,
        'END:VALARM',
        'END:VEVENT'
      );
    });
  });

  icsContent.push('END:VCALENDAR');

  // Create and download file
  const blob = new Blob([icsContent.join('\r\n')], {
    type: 'text/calendar;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `schedule-${format(new Date(), 'yyyy-MM-dd')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatICalDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}
