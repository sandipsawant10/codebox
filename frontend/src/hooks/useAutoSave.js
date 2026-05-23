import { useEffect, useRef } from 'react';
import { useSandboxStore } from '../store/sandboxStore';
import { projectsApi } from '../api';
import toast from 'react-hot-toast';


export function useAutoSave() {
  const { projectId, isDirty, getFilesArray, markSaved, setIsSaving } = useSandboxStore();
  const timerRef = useRef(null);

  const save = async (showToast = false) => {
    if (!projectId || !isDirty) return;
    setIsSaving(true);
    try {
      await projectsApi.update(projectId, { files: getFilesArray() });
      markSaved();
      if (showToast) toast.success('Saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  // debounced auto-save
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(), 2000);
    return () => clearTimeout(timerRef.current);
  }, [isDirty, projectId]);

  // Ctrl+S manual save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [projectId, isDirty]);

  return { save: () => save(true) };
}
