export const metadata = {
  title: 'Términos y Condiciones — Volunti',
};

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 prose prose-slate">
      <h1 className="text-3xl font-bold mb-8">Términos y Condiciones</h1>
      
      <p><strong>Última actualización:</strong> Agosto 2026</p>

      <h2>1. Uso de la plataforma</h2>
      <p>
        Volunti es una plataforma digital de coordinación de ayuda humanitaria.
        Al acceder o utilizar nuestro sitio web, aceptas cumplir con estos términos y condiciones.
      </p>

      <h2>2. Conducta del usuario</h2>
      <p>
        Te comprometes a utilizar Volunti con fines legítimos y solidarios.
        No debes usar la plataforma para publicar contenido falso, ofensivo, ilícito, o realizar fraudes.
        Cualquier abuso puede resultar en el bloqueo o eliminación permanente de tu cuenta.
      </p>

      <h2>3. Deslinde de responsabilidad</h2>
      <p>
        Volunti actúa únicamente como un intermediario tecnológico para conectar a personas y organizaciones.
        No verificamos físicamente la veracidad de cada oferta, donación o necesidad publicada por los usuarios.
        <strong>Las transacciones, encuentros y entregas se realizan bajo tu propio riesgo.</strong>
        Recomendamos tomar precauciones de seguridad al coordinar entregas físicas.
      </p>

      <h2>4. Modificación de los términos</h2>
      <p>
        Nos reservamos el derecho de modificar estos términos en cualquier momento.
        Los cambios entrarán en vigor tan pronto como sean publicados en esta página.
      </p>

      <h2>5. Ley aplicable</h2>
      <p>
        Estos términos se rigen e interpretan de acuerdo con las leyes de la República de Colombia.
      </p>

      <div className="mt-12 p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
        <strong>Nota:</strong> Este documento fue generado con asistencia de IA como punto de partida y aún no fue revisado por un abogado. No debe considerarse asesoría legal definitiva.
      </div>
    </div>
  );
}
