export const metadata = {
  title: 'Política de Privacidad — Volunti',
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 prose prose-slate">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidad</h1>
      
      <p><strong>Última actualización:</strong> Agosto 2026</p>

      <h2>1. Datos que recogemos</h2>
      <p>
        En Volunti recopilamos la siguiente información personal:
        nombre, dirección de correo electrónico, número de teléfono (WhatsApp),
        ubicación (ciudad/departamento), y fotografías (opcionales para perfiles o evidencias de donaciones).
      </p>

      <h2>2. Finalidad del tratamiento</h2>
      <p>
        Los datos recopilados son utilizados exclusivamente con el fin de coordinar y facilitar
        el ecosistema de ayuda humanitaria entre los usuarios de la plataforma (Organizaciones y usuarios Persona a Persona).
      </p>

      <h2>3. Derechos del titular (Habeas Data - Ley 1581 de 2012)</h2>
      <p>
        De acuerdo con la ley colombiana, tienes derecho a:
        conocer, actualizar, rectificar, suprimir tu información, y revocar la autorización del uso de tus datos.
      </p>

      <h2>4. Ejercicio de tus derechos</h2>
      <p>
        Para ejercer tus derechos o realizar cualquier consulta sobre privacidad, puedes contactar
        a nuestro canal de soporte: <a href="mailto:jcgm1047@gmail.com">jcgm1047@gmail.com</a>.
      </p>

      <h2>5. Transferencia a terceros</h2>
      <p>
        Volunti <strong>no vende, alquila ni comercializa</strong> tus datos personales con terceros.
        Parte de tu información (como nombre, alias, o número de contacto) será visible para otros
        usuarios validados únicamente con el propósito de coordinar la entrega o recepción de donaciones y ayuda.
      </p>

      <h2>6. Retención y seguridad</h2>
      <p>
        Mantenemos tus datos por un tiempo razonable y necesario para cumplir con nuestras finalidades.
        Implementamos medidas de seguridad generales de la industria para proteger tus datos contra accesos no autorizados.
      </p>

      <div className="mt-12 p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground">
        <strong>Nota:</strong> Este documento fue generado con asistencia de IA como punto de partida y aún no fue revisado por un abogado. No debe considerarse asesoría legal definitiva.
      </div>
    </div>
  );
}
