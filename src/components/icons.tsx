import {
  ArrowLeftRight, Baby, Banknote, BookOpen, Bus, Car, Coffee, CreditCard, Dumbbell, Ellipsis, Fuel, Gamepad2, Gift,
  GraduationCap, HandHeart, HeartPulse, House, Landmark, Percent, PiggyBank, Plane, Receipt, Scissors, Shirt, ShoppingBag,
  ShoppingCart, SlidersHorizontal, Smartphone, Sparkles, Tag, TramFront, Utensils, Wallet, Wifi, type LucideIcon,
} from 'lucide-react';
import type { Account, Category } from '../db/types';

export const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  coffee: Coffee,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  'tram-front': TramFront,
  bus: Bus,
  car: Car,
  fuel: Fuel,
  plane: Plane,
  house: House,
  receipt: Receipt,
  wifi: Wifi,
  smartphone: Smartphone,
  'heart-pulse': HeartPulse,
  dumbbell: Dumbbell,
  'gamepad-2': Gamepad2,
  shirt: Shirt,
  scissors: Scissors,
  'hand-heart': HandHeart,
  baby: Baby,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'arrow-left-right': ArrowLeftRight,
  ellipsis: Ellipsis,
  banknote: Banknote,
  sparkles: Sparkles,
  percent: Percent,
  gift: Gift,
  tag: Tag,
  landmark: Landmark,
  'piggy-bank': PiggyBank,
  wallet: Wallet,
  'credit-card': CreditCard,
  sliders: SlidersHorizontal,
};

export const CATEGORY_ICON_CHOICES = Object.keys(ICONS).filter((k) => !['landmark', 'piggy-bank', 'wallet', 'credit-card', 'sliders'].includes(k));
export const ACCOUNT_ICON_CHOICES = ['landmark', 'piggy-bank', 'wallet', 'credit-card', 'smartphone', 'banknote'];

/** 40px rounded-square tile tinted with the item's colour at 15% (DESIGN.md › Shapes). */
export function IconTile({ icon, color, size = 40, className = '' }: { icon: string; color: string; size?: number; className?: string }) {
  const Icon = ICONS[icon] ?? Ellipsis;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{ width: size, height: size, backgroundColor: `${color}26`, color }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={1.75} />
    </span>
  );
}

export const CategoryTile = ({ category, size }: { category?: Category; size?: number }) => (
  <IconTile icon={category?.icon ?? 'ellipsis'} color={category?.color ?? '#64748B'} size={size} />
);

export const AccountTile = ({ account, size }: { account?: Account; size?: number }) => (
  <IconTile icon={account?.icon ?? 'landmark'} color={account?.color ?? '#475569'} size={size} />
);

export const defaultAccountIcon = (type: Account['type']) => (type === 'cash' ? 'wallet' : type === 'ewallet' ? 'smartphone' : 'landmark');
