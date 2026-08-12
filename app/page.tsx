import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Volunti</h1>
      <p className="text-muted-foreground">
        Plataforma de coordinación de ayuda humanitaria. Scaffold inicial — las
        pantallas llegan en el checkpoint 2.
      </p>
      <Button size="lg">Registrarme</Button>
    </section>
  );
}
