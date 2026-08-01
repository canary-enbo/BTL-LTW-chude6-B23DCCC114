// Custom hooks cho Redux — giúp gọi dispatch và selector dễ dàng hơn
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Hook dispatch với kiểu AppDispatch (hỗ trợ thunk)
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook selector với kiểu RootState
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
