'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { unblockTargetAction } from './actions';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UnblockButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUnblock() {
    setLoading(true);
    const result = await unblockTargetAction(reportId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Error al desbloquear');
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleUnblock} 
      disabled={loading} 
      variant="outline" 
      size="sm"
      className="h-8"
    >
      {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
      Desbloquear
    </Button>
  );
}
