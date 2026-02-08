/**
 * 保存済み編成の一覧表示・読み込み・削除パネル
 */

import { useState, useEffect } from 'preact/hooks';
import type { SavedFormation, Formation } from '../lib/types';
import { getSavedFormations, deleteSavedFormation, saveFormation } from '../lib/savedFormations';

type SavedFormationsPanelProps = {
  formation: Formation;
  onLoad: (formation: Formation) => void;
};

export const SavedFormationsPanel = ({
  formation,
  onLoad,
}: SavedFormationsPanelProps) => {
  const [savedFormations, setSavedFormations] = useState<SavedFormation[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SavedFormation | null>(null);

  const refreshList = () => {
    setSavedFormations(getSavedFormations());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const canSave = formation.unitA !== null && formation.unitB !== null;

  const handleSave = () => {
    if (!canSave || saveName.trim() === '') return;

    saveFormation(saveName.trim(), formation);
    setSaveName('');
    setIsSaveDialogOpen(false);
    refreshList();
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteSavedFormation(deleteTarget.id);
    setDeleteTarget(null);
    refreshList();
  };

  const handleLoad = (saved: SavedFormation) => {
    onLoad(saved.formation);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const formatCostInfo = (saved: SavedFormation): string => {
    const { unitA, unitB } = saved.formation;
    if (!unitA || !unitB) return '';
    return `${unitA.cost}/${unitB.cost}`;
  };

  return (
    <div class="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">
          保存編成
        </h3>
        {canSave && (
          <button
            data-testid="save-formation-button"
            onClick={() => setIsSaveDialogOpen(!isSaveDialogOpen)}
            class="text-sm px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            {isSaveDialogOpen ? '閉じる' : '編成を保存'}
          </button>
        )}
      </div>

      {/* 保存ダイアログ */}
      {isSaveDialogOpen && (
        <div data-testid="save-dialog" class="mb-3 p-3 bg-slate-100 dark:bg-slate-700 rounded">
          <label class="block text-sm text-slate-600 dark:text-slate-400 mb-1">
            編成名
          </label>
          <div class="flex gap-2">
            <input
              data-testid="save-name-input"
              type="text"
              value={saveName}
              onInput={(e) => setSaveName((e.target as HTMLInputElement).value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="例: メイン編成"
              class="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={30}
            />
            <button
              data-testid="save-confirm-button"
              onClick={handleSave}
              disabled={saveName.trim() === ''}
              class="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 保存済み編成一覧 */}
      {savedFormations.length === 0 ? (
        <p class="text-sm text-slate-500 dark:text-slate-400">
          保存された編成はありません
        </p>
      ) : (
        <ul data-testid="saved-formations-list" class="space-y-2">
          {savedFormations.map((saved) => (
            <li
              key={saved.id}
              data-testid={`saved-formation-${saved.id}`}
              onClick={() => handleLoad(saved)}
              class="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {saved.name}
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  <span class="font-mono">{formatCostInfo(saved)}</span>
                  <span class="mx-1">|</span>
                  <span>{formatDate(saved.savedAt)}</span>
                </div>
              </div>
              <button
                data-testid={`delete-formation-${saved.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(saved);
                }}
                class="text-xs px-2 py-1 ml-2 shrink-0 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 削除確認モーダル */}
      {deleteTarget && (
        <div
          data-testid="delete-confirm-modal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            class="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 mx-4 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p class="text-sm text-slate-800 dark:text-slate-200 mb-4">
              「{deleteTarget.name}」を削除しますか？
            </p>
            <div class="flex justify-end gap-2">
              <button
                data-testid="delete-cancel-button"
                onClick={() => setDeleteTarget(null)}
                class="text-sm px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded transition-colors"
              >
                キャンセル
              </button>
              <button
                data-testid="delete-confirm-button"
                onClick={handleDeleteConfirm}
                class="text-sm px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
