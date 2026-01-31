import {
  HardHat,
  Wheat,
  Truck,
  HandHelping,
  Sparkles,
  ChefHat,
  PaintRoller,
  Package,
  Briefcase,
} from 'lucide-react';

interface JobIconProps {
  icon: string;
  className?: string;
}

export function JobIcon({ icon, className = "w-6 h-6" }: JobIconProps) {
  const iconMap: Record<string, React.ReactNode> = {
    'hard-hat': <HardHat className={className} />,
    'wheat': <Wheat className={className} />,
    'truck': <Truck className={className} />,
    'hand-helping': <HandHelping className={className} />,
    'sparkles': <Sparkles className={className} />,
    'chef-hat': <ChefHat className={className} />,
    'paint-roller': <PaintRoller className={className} />,
    'package': <Package className={className} />,
  };

  return iconMap[icon] || <Briefcase className={className} />;
}
