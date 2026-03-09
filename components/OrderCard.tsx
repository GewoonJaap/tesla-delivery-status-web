import React, { useState, useMemo } from 'react';
import { CombinedOrder, OrderDiff, TeslaTask } from '../types';
import { CalendarIcon, CarIcon, ClockIcon, GeoIcon, GaugeIcon, KeyIcon, PinIcon, CompanyIcon, OptionsIcon, DeliveryIcon, ChevronDownIcon, ETAIcon, ChecklistIcon, TasksIcon, HistoryIcon, JsonIcon, InfoIcon, ArrowRightIcon, LicensePlateIcon } from './icons';
import { COMPOSITOR_BASE_URL, FALLBACK_CAR_IMAGE_URLS } from '../constants';
import { TESLA_STORES } from '../data/tesla-stores';
import OrderTimeline from './OrderTimeline';
import DeliveryChecklist from './DeliveryChecklist';
import VehicleOptions from './VehicleOptions';
import TasksList from './TasksList';
import HistoryModal from './HistoryModal';
import JsonViewer from './JsonViewer';
import ImageCarousel from './ImageCarousel';
import DeliveryGates from './DeliveryGates';
import VinDecoder from './VinDecoder';
import Tooltip from './Tooltip';
import SchedulingBanner from './SchedulingBanner';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import CountdownTimer from './CountdownTimer';
import TradeInDetails from './TradeInDetails';

interface OrderCardProps {
  combinedOrder: CombinedOrder;
  diff: OrderDiff;
  hasNewChanges: boolean;
}

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  diffValue?: { old: any; new: any };
  tooltipText?: string;
}> = ({ icon, label, value, diffValue, tooltipText }) => {
  const hasChanged = diffValue && JSON.stringify(diffValue.old) !== JSON.stringify(diffValue.new);

  const oldValueOrDefault = (val: any) => {
    // Treat undefined, null, and empty strings as 'N/A'
    if (val === undefined || val === null || val === '') {
      return 'N/A';
    }
    return val;
  };

  const displayValue = hasChanged ? oldValueOrDefault(diffValue.new) : oldValueOrDefault(value);
  const highlightClass = hasChanged ? 'bg-yellow-500/10 ring-1 ring-inset ring-yellow-500/20' : '';
  const valueClass = (displayValue === 'N/A') ? 'text-gray-400 dark:text-tesla-gray-500 font-normal' : 'text-gray-800 dark:text-white font-semibold';

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg ${highlightClass}`}>
      <div className="flex-shrink-0 h-6 w-6 text-gray-400 dark:text-tesla-gray-400 pt-0.5">{icon}</div>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-gray-500 dark:text-tesla-gray-400">{label}</p>
          {tooltipText && (
            <Tooltip text={tooltipText}>
              <InfoIcon className="w-3.5 h-3.5 text-gray-400 dark:text-tesla-gray-500 cursor-help" />
            </Tooltip>
          )}
        </div>
        <p className={`text-base break-words ${valueClass}`}>{displayValue}</p>
        {hasChanged && (
          <p className="text-xs text-yellow-400 mt-1">
            From: <span className="line-through">{oldValueOrDefault(diffValue.old)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

const normalizeModelCode = (apiCode?: string): string => {
    if (!apiCode) return 'UNKNOWN';
    const code = apiCode.toLowerCase().replace(/model\s?/i, '').trim();
    switch (code) {
        case 'ms': case 's': return 'S';
        case 'm3': case '3': return '3';
        case 'mx': case 'x': return 'X';
        case 'my': case 'y': return 'Y';
        case 'ct': case 'cybertruck': return 'CYBERTRUCK';
        default:
            const upperCode = apiCode.toUpperCase();
            return upperCode in FALLBACK_CAR_IMAGE_URLS ? upperCode : apiCode;
    }
};

const getModelApiCode = (apiCode?: string): string | null => {
    if (!apiCode) return null;
    const code = apiCode.toLowerCase().replace(/model\s?/i, '').trim();
    switch (code) {
        case 'ms': case 's': return 'ms';
        case 'm3': case '3': return 'm3';
        case 'mx': case 'x': return 'mx';
        case 'my': case 'y': return 'my';
        case 'ct': case 'cybertruck': return 'ct';
        default:
            return null;
    }
};

const generateCompositorUrl = (orderData: CombinedOrder['order'], view: string): string | null => {
      const model = getModelApiCode(orderData.modelCode);
      const options = orderData.mktOptions;

      if (!model || !options) {
        return null;
      }
      
      const formattedOptions = options.split(',').filter(o => o.trim()).map(o => `$${o.trim()}`).join(',');

      const baseParams: Record<string, string> = {
          context: 'design_studio_2',
          bkba_opt: '1',
          model,
          options: formattedOptions,
          view,
          size: '1024',
          crop: '1150,647,390,180'
      };

      // View-specific adjustments
      switch (view) {
          case 'RIMCLOSEUP':
              baseParams.crop = '0,0,80,0';
              baseParams.size = '800';
              break;
      }

      const params = new URLSearchParams(baseParams);
      return `${COMPOSITOR_BASE_URL}?${params.toString()}`;
};


const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusLower = status.toLowerCase();
    let colorClasses = 'bg-gray-500 text-gray-100'; // Default
    if (statusLower.includes('book')) {
        colorClasses = 'bg-blue-500 text-white';
    } else if (statusLower.includes('progress') || statusLower.includes('pending')) {
        colorClasses = 'bg-yellow-500 text-white';
    } else if (statusLower.includes('delivered') || statusLower.includes('complete')) {
        colorClasses = 'bg-green-500 text-white';
    } else if (statusLower.includes('cancel')) {
        colorClasses = 'bg-red-500 text-white';
    }

    return (
        <span className={`px-2.5 py-1 text-sm font-semibold rounded-full ${colorClasses}`}>
            {status}
        </span>
    );
};


const OrderCard: React.FC<OrderCardProps> = ({ combinedOrder, diff, hasNewChanges }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'details' | 'checklist' | 'tasks' | 'json'>('details');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  const { order, details } = combinedOrder;
  const schedulingTask = details?.tasks?.scheduling;

  const handleViewAppointment = () => {
    if (schedulingTask && schedulingTask.apptDateTimeAddressStr) {
      setIsAppointmentModalOpen(true);
    }
  };

  const getDiffFor = (path: string) => diff[path];
  
  const getVehicleLocationName = (locationCode?: string) => {
    if (!locationCode) return 'N/A';
    return TESLA_STORES[locationCode] || `Unknown Code (${locationCode})`;
  };

  const getOdometer = () => {
    const odometerValue = details?.tasks?.registration?.orderDetails?.vehicleOdometer;
    if (!odometerValue) return 'N/A';
    return `${odometerValue} ${details?.tasks?.registration?.orderDetails?.vehicleOdometerType || ''}`.trim();
  }

  const formatDeliveryType = (type?: string) => {
    if (!type) return 'N/A';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const createDiffWithValue = (path: string, transformFn?: (val: any) => string) => {
    const d = getDiffFor(path);
    // Safe navigation for deeply nested properties
    const value = path.split('.').reduce((o, i) => o?.[i], combinedOrder as any);
    const transformedValue = transformFn && value ? transformFn(value) : value;

    if (d) {
        return {
            diffValue: { old: transformFn && d.old ? transformFn(d.old) : d.old, new: transformFn && d.new ? transformFn(d.new) : d.new },
            value: transformedValue
        };
    }
    return { value: transformedValue };
  };

  const modelCode = normalizeModelCode(order.modelCode);

  const carouselImages = useMemo(() => {
    const imageConfigs = [
      { view: 'STUD_3QTR', label: 'Exterior' },
      { view: 'SIDE', label: 'Side Profile' },
      { view: 'REAR34', label: 'Rear Quarter' },
      { view: 'STUD_SEAT', label: 'Front Interior' },
      { view: 'INTERIOR_ROW2', label: 'Rear Interior' },
      { view: 'RIMCLOSEUP', label: 'Wheel Detail' },
    ];

    const generated = imageConfigs
      .map(({ view, label }) => ({
        src: generateCompositorUrl(order, view),
        alt: `Tesla Model ${modelCode} - ${label}`,
        label: label,
      }))
      .filter((img): img is { src: string; alt: string; label: string } => img.src !== null);

    if (generated.length > 0) {
      return generated;
    }

    // Fallback if no compositor images can be generated
    const fallbackImageUrl = modelCode ? FALLBACK_CAR_IMAGE_URLS[modelCode] : undefined;
    if (fallbackImageUrl) {
      return [{
        src: fallbackImageUrl,
        alt: `Tesla Model ${modelCode}`,
        label: 'Vehicle',
      }];
    }
    
    return [];
  }, [order, modelCode]);

  const vin = createDiffWithValue('order.vin');
  let licensePlate = createDiffWithValue('details.tasks.deliveryDetails.regData.reggieLicensePlate');
  if (!licensePlate.value) {
    licensePlate = createDiffWithValue('details.tasks.registration.regData.reggieLicensePlate');
  }
  const deliveryWindow = createDiffWithValue('details.tasks.scheduling.deliveryWindowDisplay');
  const appointment = createDiffWithValue('details.tasks.scheduling.apptDateTimeAddressStr');
  const eta = createDiffWithValue('details.tasks.finalPayment.data.etaToDeliveryCenter');
  const vehicleLocation = createDiffWithValue('details.tasks.registration.orderDetails.vehicleRoutingLocation', getVehicleLocationName);
  const deliveryMethod = createDiffWithValue('details.tasks.scheduling.deliveryType', formatDeliveryType);
  const deliveryCenter = createDiffWithValue('details.tasks.scheduling.deliveryAddressTitle');
  const odometer = createDiffWithValue('details.tasks.registration.orderDetails.vehicleOdometer', getOdometer);
  const reservationDate = createDiffWithValue('details.tasks.registration.orderDetails.reservationDate', val => val ? new Date(val).toLocaleDateString() : 'N/A');
  const orderBookedDate = createDiffWithValue('details.tasks.registration.orderDetails.orderBookedDate', val => val ? new Date(val).toLocaleDateString() : 'N/A');
  const companyName = createDiffWithValue('order.ownerCompanyName');
  const mktOptions = createDiffWithValue('order.mktOptions');

  const TabButton: React.FC<{
    view: 'details' | 'checklist' | 'tasks' | 'json';
    label: string;
    icon: React.ReactNode;
  }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-tesla-gray-800 ${
        activeView === view
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
          : 'text-gray-500 dark:text-tesla-gray-400 border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-tesla-gray-700/50'
      }`}
      aria-pressed={activeView === view}
      role="tab"
    >
      {icon}
      {label}
    </button>
  );

  const oldValueOrDefault = (val: any) => {
    if (val === undefined || val === null || val === '') return 'N/A';
    return val;
  };

  return (
    <>
      <article className="bg-white dark:bg-tesla-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-gray-200 dark:border-tesla-gray-700/50 transition-all duration-300 ease-in-out hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-tesla-red/10">
        {carouselImages.length > 0 ? (
          <ImageCarousel images={carouselImages} />
        ) : (
          <div className="bg-gray-100 dark:bg-black/20 h-64 flex items-center justify-center">
            <CarIcon className="w-24 h-24 text-gray-300 dark:text-tesla-gray-600" />
          </div>
        )}
        <header className="p-5 border-b border-gray-200 dark:border-tesla-gray-700/50">
          <div className="flex justify-between items-start gap-4">
              <div>
                   <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Model {modelCode}</h2>
                      {order.isUsed && (
                          <span className="text-xs font-semibold bg-amber-500/80 text-white px-2 py-0.5 rounded-full">
                              USED
                          </span>
                      )}
                   </div>
                   <p className="text-xs font-mono text-gray-500 dark:text-tesla-gray-400 mt-1" aria-label={`Reference Number: ${order.referenceNumber}`}>{order.referenceNumber}</p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                  <button
                      onClick={() => setIsHistoryModalOpen(true)}
                      className={`p-2 rounded-full text-gray-500 dark:text-tesla-gray-400 hover:bg-gray-200 dark:hover:bg-tesla-gray-700 transition-all duration-150 active:scale-90 active:bg-gray-300 dark:active:bg-tesla-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-tesla-gray-800 ${
                        hasNewChanges ? 'bg-yellow-500/10 ring-2 ring-yellow-500/40 animate-pulse' : ''
                      }`}
                      aria-label={hasNewChanges ? 'View Order History (New Changes)' : 'View Order History'}
                  >
                      <HistoryIcon className="w-5 h-5" />
                  </button>
                  <OrderStatusBadge status={order.orderStatus} />
              </div>
          </div>
        </header>

        <div className="border-b border-gray-200 dark:border-tesla-gray-700/50">
          <OrderTimeline combinedOrder={combinedOrder} />
        </div>

        {/* --- Countdown Timer --- */}
        {schedulingTask?.apptDateTimeAddressStr && (
          <CountdownTimer targetDateString={schedulingTask.apptDateTimeAddressStr} />
        )}
        
        <SchedulingBanner schedulingTask={schedulingTask} />

        {/* --- View Switcher --- */}
        <div className="flex border-b border-gray-200 dark:border-tesla-gray-700/50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" role="tablist">
          <TabButton view="details" label="Order Details" icon={<CarIcon className="w-5 h-5" />} />
          <TabButton view="tasks" label="App Tasks" icon={<TasksIcon className="w-5 h-5" />} />
          <TabButton view="checklist" label="Delivery Checklist" icon={<ChecklistIcon className="w-5 h-5" />} />
          <TabButton view="json" label="Full JSON" icon={<JsonIcon className="w-5 h-5" />} />
        </div>

        {/* --- Conditional Content --- */}
        {activeView === 'details' && (
          <div className="flex-grow flex flex-col animate-fade-in-up" role="tabpanel">
            <div className="p-5 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  {(() => {
                      const hasChanged = !!vin.diffValue;
                      const displayValue = hasChanged ? oldValueOrDefault(vin.diffValue.new) : oldValueOrDefault(vin.value);
                      const highlightClass = hasChanged ? 'bg-yellow-500/10 ring-1 ring-inset ring-yellow-500/20' : '';
                      const valueClass = (displayValue === 'N/A') ? 'text-gray-400 dark:text-tesla-gray-500 font-normal' : 'text-gray-800 dark:text-white font-semibold';
                      
                      return (
                        <div className={`flex items-start space-x-3 p-3 rounded-lg md:col-span-2 ${highlightClass}`}>
                          <div className="flex-shrink-0 h-6 w-6 text-gray-400 dark:text-tesla-gray-400 pt-0.5"><KeyIcon /></div>
                          <div className="w-full">
                            <p className="text-sm font-medium text-gray-500 dark:text-tesla-gray-400">VIN</p>
                            <p className={`text-base break-words ${valueClass}`}>{displayValue}</p>
                            {hasChanged && (
                              <p className="text-xs text-yellow-400 mt-1">
                                From: <span className="line-through">{oldValueOrDefault(vin.diffValue.old)}</span>
                              </p>
                            )}
                            {vin.value && vin.value !== 'N/A' && <VinDecoder vin={vin.value} />}
                          </div>
                        </div>
                      );
                  })()}

                  <DetailItem icon={<LicensePlateIcon />} label="License Plate" value={licensePlate.value} diffValue={licensePlate.diffValue} tooltipText="The official license plate number assigned to your vehicle." />
                  <DetailItem icon={<ETAIcon />} label="ETA to Delivery Center" value={eta.value} diffValue={eta.diffValue} tooltipText="Estimated Time of Arrival of your vehicle at the designated delivery center. This is not your delivery date." />

                  <div className="md:col-span-2">
                      <DetailItem icon={<ClockIcon />} label="Delivery Window" value={deliveryWindow.value} diffValue={deliveryWindow.diffValue} tooltipText="The timeframe provided by Tesla during which your delivery is expected to take place. This may change." />
                  </div>
                  <div className="md:col-span-2">
                      <DetailItem icon={<PinIcon />} label="Delivery Appointment" value={appointment.value} diffValue={appointment.diffValue} tooltipText="Your confirmed date, time, and location for vehicle pickup." />
                  </div>

                  <DetailItem icon={<CarIcon />} label="Vehicle Location" value={vehicleLocation.value} diffValue={vehicleLocation.diffValue} tooltipText="The last reported location of your vehicle in Tesla's logistics system." />
                  <DetailItem icon={<DeliveryIcon />} label="Delivery Method" value={deliveryMethod.value} diffValue={deliveryMethod.diffValue} tooltipText="How your vehicle will be delivered (e.g., Pickup at a Tesla center, Home Delivery)." />
                  <DetailItem icon={<GeoIcon />} label="Delivery Center" value={deliveryCenter.value} diffValue={deliveryCenter.diffValue} tooltipText="The Tesla location where you will pick up your vehicle." />
                  <DetailItem icon={<GaugeIcon />} label="Odometer" value={odometer.value} diffValue={odometer.diffValue} tooltipText="The vehicle's mileage at the time of the last data sync. It's normal for new cars to have a few miles from factory testing and transport." />
                  <DetailItem icon={<CalendarIcon />} label="Order Booked Date" value={orderBookedDate.value} diffValue={orderBookedDate.diffValue} tooltipText="The date your order was officially confirmed and placed in the production queue." />
                  
                  {order.isB2b && <div className="md:col-span-2"><DetailItem icon={<CompanyIcon />} label="Company" value={companyName.value} diffValue={companyName.diffValue} tooltipText="The company name associated with the order, typically for business or fleet purchases." /></div>}
              </div>

              <DeliveryGates gates={details?.tasks?.deliveryAcceptance?.gates} />

              <TradeInDetails tradeInData={details?.tasks?.tradeIn} />
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen mt-4 pt-4 border-t border-gray-200 dark:border-tesla-gray-700/50' : 'max-h-0'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                      <DetailItem icon={<CalendarIcon />} label="Reservation Date" value={reservationDate.value} diffValue={reservationDate.diffValue} tooltipText="The date you initially placed your reservation or pre-order." />
                      <div className={`md:col-span-2 flex items-start space-x-3 p-3 rounded-lg ${mktOptions.diffValue ? 'bg-yellow-500/10 ring-1 ring-inset ring-yellow-500/20' : ''}`}>
                          <div className="flex-shrink-0 h-6 w-6 text-gray-400 dark:text-tesla-gray-400 pt-0.5"><OptionsIcon /></div>
                          <div className="w-full overflow-hidden">
                              <p className="text-sm font-medium text-gray-500 dark:text-tesla-gray-400">Vehicle Options</p>
                              <VehicleOptions
                                  optionsString={mktOptions.value}
                                  diffValue={mktOptions.diffValue}
                              />
                          </div>
                      </div>
                  </div>
              </div>
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-tesla-gray-700/50">
                <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-center items-center text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-tesla-gray-300 dark:hover:text-white transition-all duration-150 py-1 rounded-md active:bg-gray-100 dark:active:bg-tesla-gray-700/50">
                  {isExpanded ? 'Show Less' : 'Show More Details'}
                  <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div role="tabpanel" className="flex-grow animate-fade-in-up">
            <TasksList tasksData={details.tasks} onViewAppointment={handleViewAppointment} />
          </div>
        )}

        {activeView === 'checklist' && (
          <div role="tabpanel" className="animate-fade-in-up">
              <DeliveryChecklist orderReferenceNumber={order.referenceNumber} />
          </div>
        )}

        {activeView === 'json' && (
          <div role="tabpanel" className="flex-grow animate-fade-in-up">
            <JsonViewer data={combinedOrder} />
          </div>
        )}
      </article>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        orderReferenceNumber={order.referenceNumber}
      />
      
      <AppointmentDetailsModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        schedulingTask={schedulingTask}
      />
    </>
  );
};

export default OrderCard;