import { getReportsAction } from './actions';
import { UnblockButton } from './unblock-button';

export const metadata = {
  title: 'Moderación — Reportes',
};

export default async function AdminPage() {
  const reports = await getReportsAction();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Moderación — Reportes</h1>
      
      <div className="rounded-md border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Reportado por</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Información</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No hay reportes actualmente.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{report.reporterName}</td>
                    <td className="px-4 py-3 capitalize">{report.targetType === 'offer' ? 'Oferta' : 'Perfil'}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={report.targetInfo}>
                      {report.targetInfo}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={report.reason}>
                      {report.reason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {report.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report.isBlocked ? (
                        <UnblockButton reportId={report.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground px-2">Activo</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
