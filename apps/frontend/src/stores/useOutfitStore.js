import { create } from 'zustand'

const useOutfitStore = create((set) => ({
  suggestions: null,
  streamingText: '',
  occasion: '',

  setSuggestions: (suggestions) => set({ suggestions }),
  setStreamingText: (streamingText) => set({ streamingText }),
  appendStreamingText: (token) => set(s => ({ streamingText: s.streamingText + token })),
  setOccasion: (occasion) => set({ occasion }),

  reset: () => set({ suggestions: null, streamingText: '', occasion: '' }),
}))

export default useOutfitStore
