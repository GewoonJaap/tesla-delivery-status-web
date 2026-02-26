import React from 'react';
import {
  LogOut,
  RefreshCw,
  KeyRound,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Car,
  GaugeCircle,
  Building2,
  Cog,
  Truck,
  ChevronDown,
  Hourglass,
  Sun,
  Moon,
  ClipboardList,
  CheckCircle2,
  ClipboardCheck,
  Check,
  PlusCircle,
  MinusCircle,
  ListChecks,
  Circle,
  ArrowRight,
  History,
  X,
  FileText,
  Braces,
  Copy,
  Github,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Info,
  RotateCcw,
  Map,
  RectangleHorizontal,
  ArrowRightLeft,
  Trash2,
  Menu,
} from 'lucide-react';

export const TeslaLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1027.737 1024"
    className={className}
    role="img"
    aria-label="Tesla Logo"
  >
    <path
      fill="currentColor"
      d="M514.491 1024l143.884-809.11c137.031 0 180.632 14.95 186.861 76.614 0 0 92.185-34.258 138.277-104.02C802.258 103.397 620.38 99.66 620.38 99.66L514.49 229.217 407.981 99.659s-181.879 3.738-363.134 87.825c46.092 69.762 138.277 104.02 138.277 104.02 6.229-61.665 49.207-76.613 185.616-76.613L514.49 1024z"
    />
    <path
      fill="currentColor"
      d="M513.869 62.287c146.374-1.246 313.927 22.423 485.216 97.168 23.046-41.11 28.652-59.173 28.652-59.173C840.876 26.161 665.227.622 513.87 0 363.134.623 187.484 26.16 0 100.282c0 0 8.097 22.424 28.652 59.173C200.564 84.71 368.117 61.041 513.87 62.287z"
    />
  </svg>
);

// Re-exporting from lucide-react with original component names
// This avoids having to refactor the components that use them.
export const LogoutIcon = LogOut;
export const RefreshIcon = RefreshCw;
export const KeyIcon = KeyRound;
export const CalendarIcon = Calendar;
export const ClockIcon = Clock;
export const GeoIcon = Globe;
export const PinIcon = MapPin;
export const CarIcon = Car;
export const GaugeIcon = GaugeCircle;
export const CompanyIcon = Building2;
export const OptionsIcon = Cog;
export const DeliveryIcon = Truck;
export const ChevronDownIcon = ChevronDown;
export const ETAIcon = Hourglass;
export const SunIcon = Sun;
export const MoonIcon = Moon;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;


// Icons for Timeline
export const TimelinePlacedIcon = ClipboardList;
export const TimelineDeliveredIcon = CheckCircle2;
export const ChecklistIcon = ClipboardCheck;

// Icons for Options Decoder
export const CheckIcon = Check;
export const PlusCircleIcon = PlusCircle;
export const MinusCircleIcon = MinusCircle;

// Icons for Tasks
export const TasksIcon = ListChecks;
export const CircleIcon = Circle;
export const ArrowRightIcon = ArrowRight;

// Icons for History
export const HistoryIcon = History;
export const XIcon = X;
export const FileTextIcon = FileText;

// Icons for JSON Viewer
export const JsonIcon = Braces;
export const CopyIcon = Copy;

// Icon for Github link
export const GithubIcon = Github;

// Icon for donation link
export const CoffeeIcon = Coffee;

// Icon for tooltips
export const InfoIcon = Info;

// Icon for Dev Mode
export const ResetIcon = RotateCcw;

// Icon for Maps
export const MapIcon = Map;

// Icon for License Plate
export const LicensePlateIcon = RectangleHorizontal;

// Icon for Trade-In
export const TradeInIcon = ArrowRightLeft;

// Icon for Clearing data
export const TrashIcon = Trash2;

// Icon for Menu
export const MenuIcon = Menu;