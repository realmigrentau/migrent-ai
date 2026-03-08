import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Train,
  DollarSign,
  Flame,
  Star,
  Plus,
  X,
  Palette,
  FolderPlus,
} from "lucide-react";
import { COLLECTION_GRADIENTS, type WishlistCollection } from "../../hooks/useWishlist";

const EMOJI_MAP: Record<string, React.ReactNode> = {
  heart: <Heart className="w-3.5 h-3.5" />,
  train: <Train className="w-3.5 h-3.5" />,
  money: <DollarSign className="w-3.5 h-3.5" />,
  fire: <Flame className="w-3.5 h-3.5" />,
  star: <Star className="w-3.5 h-3.5" />,
  folder: <FolderPlus className="w-3.5 h-3.5" />,
};

const COLLECTION_EMOJIS = [
  { id: "heart", label: "Heart" },
  { id: "star", label: "Star" },
  { id: "fire", label: "Fire" },
  { id: "train", label: "Train" },
  { id: "money", label: "Money" },
  { id: "folder", label: "Folder" },
];

interface CollectionsBarProps {
  collections: WishlistCollection[];
  activeCollection: string;
  onSelect: (id: string) => void;
  onAddCollection: (name: string, gradientIndex: number, emoji: string) => void;
  onRemoveCollection: (id: string) => void;
}

export default function CollectionsBar({
  collections,
  activeCollection,
  onSelect,
  onAddCollection,
  onRemoveCollection,
}: CollectionsBarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState("folder");

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddCollection(newName.trim(), selectedGradient, selectedEmoji);
    setNewName("");
    setSelectedGradient(0);
    setSelectedEmoji("folder");
    setShowAddModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      {/* Scrollable collection pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {collections.map((collection, i) => {
          const isActive = activeCollection === collection.id;
          return (
            <motion.button
              key={collection.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(collection.id)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 group ${
                isActive
                  ? "text-white shadow-lg"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${collection.color}, ${collection.color}dd)`,
                      boxShadow: `0 4px 14px ${collection.color}40`,
                    }
                  : undefined
              }
            >
              <span className={isActive ? "text-white/90" : ""} style={!isActive ? { color: collection.color } : undefined}>
                {EMOJI_MAP[collection.emoji] || EMOJI_MAP.folder}
              </span>
              {collection.name}
              {collection.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  {collection.count}
                </span>
              )}

              {/* Remove button for custom collections */}
              {!collection.isSmartCollection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCollection(collection.id);
                  }}
                  className={`ml-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? "text-white/60 hover:text-white" : "text-slate-400 hover:text-red-500"
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.button>
          );
        })}

        {/* Add collection button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: collections.length * 0.04 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-rose-300 hover:text-rose-500 dark:hover:border-rose-500/30 dark:hover:text-rose-400 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </motion.button>
      </div>

      {/* Add collection modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    New Collection
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name..."
                className="input-field text-sm"
                maxLength={30}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />

              {/* Color picker */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Colour</p>
                <div className="flex flex-wrap gap-2">
                  {COLLECTION_GRADIENTS.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedGradient(i)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-r ${g.gradient} transition-all ${
                        selectedGradient === i
                          ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110"
                          : "hover:scale-110"
                      }`}
                      style={selectedGradient === i ? { outlineColor: g.color } : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Icon</p>
                <div className="flex gap-2">
                  {COLLECTION_EMOJIS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEmoji(e.id)}
                      className={`p-2 rounded-xl transition-all ${
                        selectedEmoji === e.id
                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20 scale-110"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-transparent hover:text-slate-600 dark:hover:text-slate-200"
                      }`}
                    >
                      {EMOJI_MAP[e.id]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="w-full btn-primary py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Collection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
