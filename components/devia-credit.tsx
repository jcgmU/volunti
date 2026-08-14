export function DeviaCredit({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <img src="/devia-logo.svg" alt="DevIA" className="h-4 w-auto opacity-70" />
        <p className="text-xs text-muted-foreground opacity-70">Desarrollado por DevIA</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
      <img src="/devia-logo.svg" alt="DevIA" className="h-5 w-auto opacity-70" />
      <p className="text-sm text-muted-foreground text-center">
        Desarrollado por DevIA — agencia de desarrollo de software. Proyecto realizado de forma gratuita, sin fines de lucro ni beneficio económico, como aporte a la causa humanitaria.
      </p>
    </div>
  )
}
