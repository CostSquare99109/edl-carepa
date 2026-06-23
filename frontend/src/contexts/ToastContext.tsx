import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Toaster, toast } from 'sonner';

/* ─── Toast helpers (success / info / error) ─── */

const showToast = {
 success: (msg: string) => toast.success(msg),
 error: (msg: string) => toast.error(msg),
 info: (msg: string) => toast.info(msg),
 warning: (msg: string) => toast.warning(msg),
};

/* ─── Confirm-modal state ─── */

interface ConfirmOptions {
 title: string;
 message: string;
 confirmLabel?: string;
 cancelLabel?: string;
 variant?: 'danger' | 'warning' | 'info';
 onConfirm: () => void | Promise<void>;
}

interface ConfirmState extends ConfirmOptions {
 open: boolean;
 id: number;
}

interface ToastContextValue {
 toast: typeof showToast;
 confirm: (opts: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
 const ctx = useContext(ToastContext);
 if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
 return ctx;
}

/* ─── Provider ─── */

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
 const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

 const confirm = useCallback((opts: ConfirmOptions) => {
 setConfirmState({ ...opts, open: true, id: ++_id });
 }, []);

 const handleConfirm = useCallback(async () => {
 if (confirmState) {
 try {
 await confirmState.onConfirm();
 } catch {
 showToast.error('Ocurrio un error al ejecutar la accion');
 }
 }
 setConfirmState(prev => prev ? { ...prev, open: false } : null);
 }, [confirmState]);

 const handleCancel = useCallback(() => {
 setConfirmState(prev => prev ? { ...prev, open: false } : null);
 }, []);

 const variantColor = confirmState?.variant === 'danger'
 ? 'bg-inst-rojo hover:bg-red-700 text-white'
 : confirmState?.variant === 'warning'
 ? 'bg-amber-500 hover:bg-amber-600 text-white'
 : 'bg-inst-azul hover:bg-blue-700 text-white';

 return (
 <ToastContext.Provider value={{ toast: showToast, confirm }}>
 {children}

 <Toaster
 position="top-right"
 richColors
 closeButton
 toastOptions={{
 duration: 4000,
 className: 'font-sans text-sm',
 }}
 />

 {confirmState?.open && (
 <div className="fixed inset-0 z-50 flex items-center justify-center">
 <div className="fixed inset-0 bg-black/50" onClick={handleCancel} />
 <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10">
 <h3 className="text-lg font-heading font-bold text-inst-azul mb-2">
 {confirmState.title}
 </h3>
 <p className="text-sm text-inst-texto-claro mb-6">
 {confirmState.message}
 </p>
 <div className="flex justify-end gap-3">
 <button
 onClick={handleCancel}
 className="px-4 py-2 text-sm font-medium text-inst-texto-claro bg-inst-gris rounded-lg hover:bg-gray-200 transition-colors"
 >
 {confirmState.cancelLabel || 'Cancelar'}
 </button>
 <button
 onClick={handleConfirm}
 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${variantColor}`}
 >
 {confirmState.confirmLabel || 'Confirmar'}
 </button>
 </div>
 </div>
 </div>
 )}
 </ToastContext.Provider>
 );
}
