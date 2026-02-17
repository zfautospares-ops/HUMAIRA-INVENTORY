import React, { useState, useEffect, useRef } from 'react';
import {
  Card, CardHeader, CardBody,
  Input, Button, Checkbox,
  Divider, Chip, Tooltip,
  ScrollShadow
} from "@heroui/react";
import {
  MapPin, Navigation, Settings,
  Truck, Calculator, FileText,
  Clock, Ruler, Zap, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// Google Maps API Hook
const useGoogleMaps = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  return isLoaded;
};

function App() {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyArc6Vzj2uzOK29RVvIJePIN9bS6yLPv1E';
  const isMapsLoaded = useGoogleMaps(GOOGLE_MAPS_API_KEY);

  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapsError, setMapsError] = useState(null);

  const [settings, setSettings] = useState({
    ratePerKm: 15,
    fuelPrice: 24.50,
    consumption: 15,
    returnTrip: true,
    baseRate: 500,
  });

  const [totalCost, setTotalCost] = useState(0);
  const [breakdown, setBreakdown] = useState({});

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);

  useEffect(() => {
    if (isMapsLoaded && mapRef.current && !mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: -29.8587, lng: 31.0218 },
        zoom: 12,
        disableDefaultUI: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        ],
      });

      directionsService.current = new window.google.maps.DirectionsService();
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        map: mapInstance.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#FFD700",
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });

      initAutocomplete('start-input', 'start');
      initAutocomplete('end-input', 'end');
    }
  }, [isMapsLoaded]);

  const initAutocomplete = (inputId, type) => {
    console.log(`[MAPS] initAutocomplete for ${inputId}`);
    const input = document.getElementById(inputId);
    if (!input) {
      console.warn(`[MAPS] Input ${inputId} not found`);
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      console.log(`[MAPS] Place changed for ${type}:`, place.formatted_address);
      if (!place.geometry) return;

      if (type === 'start') {
        setStartAddress(place.formatted_address);
      } else {
        setEndAddress(place.formatted_address);
      }
    });

    // Fallback sync for manual typing
    input.addEventListener('blur', (e) => {
      if (type === 'start') setStartAddress(e.target.value);
      else setEndAddress(e.target.value);
    });
  };

  const calculateRoute = () => {
    console.log('[CALC] calculateRoute triggered', { startAddress, endAddress });
    setMapsError(null);
    if (!directionsService.current) {
      console.error('[CALC] directionsService missing');
      return;
    }
    if (!startAddress || !endAddress) {
      alert('Please enter both start and end locations.');
      return;
    }

    setIsCalculating(true);
    const travelWay = window.google?.maps?.TravelMode?.DRIVING || 'DRIVING';

    directionsService.current.route(
      {
        origin: startAddress,
        destination: endAddress,
        travelMode: travelWay,
      },
      (result, status) => {
        setIsCalculating(false);
        console.log('[CALC] Directions status:', status);
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.current.setDirections(result);
          const route = result.routes[0].legs[0];
          const distKm = route.distance.value / 1000;
          const durText = route.duration.text;

          console.log('[CALC] Route Success:', { distKm, durText });
          setDistance(distKm);
          setDuration(durText);
          setMapsError(null);
          calculateCost(distKm);
        } else {
          console.error('[CALC] Route Failure:', status);
          setMapsError(status);
        }
      }
    );
  };

  const calculateCost = (dist) => {
    const { ratePerKm, fuelPrice, consumption, returnTrip, baseRate } = settings;
    const tripDistance = returnTrip ? dist * 2 : dist;
    const fuelCost = (tripDistance * (consumption / 100)) * fuelPrice;
    const serviceFee = tripDistance * ratePerKm;
    const subtotal = fuelCost + serviceFee + baseRate;

    setBreakdown({
      distance: tripDistance.toFixed(1),
      fuel: fuelCost.toFixed(2),
      service: serviceFee.toFixed(2),
      base: baseRate.toFixed(2)
    });

    setTotalCost(subtotal);
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0
    }));
  };

  useEffect(() => {
    calculateCost(0);
  }, []);

  useEffect(() => {
    calculateCost(distance);
  }, [settings, distance]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4"
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl border border-primary/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            <Truck className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black font-mono tracking-tighter text-white">MH TOWING <span className="text-primary underline decoration-2 underline-offset-4">PRO</span></h1>
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em]">Next-Gen Logistics Calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Chip
            variant="flat"
            color={mapsError ? "danger" : (totalCost > 0 ? "success" : "warning")}
            size="sm"
            startContent={mapsError ? <AlertTriangle size={14} /> : <Zap size={14} />}
            className="font-bold border border-white/10"
          >
            {mapsError ? `API ${mapsError}` : (totalCost > 0 ? 'Engine v4.0 Active' : 'System Ready')}
          </Chip>
          <Button isIconOnly variant="light" color="default" radius="full">
            <Settings size={20} className="text-gray-400" />
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-secondary/40 border-gray-800/50 backdrop-blur-md shadow-2xl">
              <CardHeader className="flex flex-col items-start px-6 pt-6">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Navigation Hub</p>
                <h2 className="text-lg font-bold">ROUTE DETAILS</h2>
              </CardHeader>
              <CardBody className="px-6 pb-6 gap-5">
                <Input
                  id="start-input"
                  label="Pickup Location"
                  variant="bordered"
                  placeholder="Enter start address"
                  labelPlacement="outside"
                  startContent={<MapPin className="text-gray-500" size={18} />}
                  value={startAddress}
                  onValueChange={setStartAddress}
                  classNames={{
                    inputWrapper: "border-gray-800 hover:border-primary group-data-[focus=true]:border-primary"
                  }}
                />

                <Input
                  id="end-input"
                  label="Drop-off Location"
                  variant="bordered"
                  placeholder="Enter destination"
                  labelPlacement="outside"
                  startContent={<Navigation className="text-gray-500" size={18} />}
                  value={endAddress}
                  onValueChange={setEndAddress}
                  classNames={{
                    inputWrapper: "border-gray-800 hover:border-primary group-data-[focus=true]:border-primary"
                  }}
                />

                <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-gray-800/50">
                  <span className="text-sm text-gray-400 font-medium">Include Return Trip</span>
                  <Checkbox
                    id="returnTrip"
                    name="returnTrip"
                    isSelected={settings.returnTrip}
                    onValueChange={(val) => setSettings(p => ({ ...p, returnTrip: val }))}
                    color="warning"
                  />
                </div>

                <Button
                  onPress={calculateRoute}
                  isLoading={isCalculating}
                  color={mapsError ? "danger" : "primary"}
                  className={`${mapsError ? 'bg-danger' : 'bg-primary shadow-[0_4px_14px_rgba(255,215,0,0.3)]'} text-black font-black uppercase tracking-widest h-14`}
                  fullWidth
                  startContent={!isCalculating && <Calculator size={20} />}
                >
                  {mapsError ? "Retry Route Calculation" : "Generate Route"}
                </Button>

                {mapsError === 'REQUEST_DENIED' && (
                  <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-[11px] text-danger font-bold leading-tight flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={18} className="shrink-0 text-danger" />
                    <div>
                      <p className="mb-1 text-[12px] uppercase tracking-wider">Access Denied</p>
                      <p className="font-sans font-normal opacity-80">Google Directions API is not enabled for this key. Please enable it in <a href="https://console.cloud.google.com/" target="_blank" className="underline">GCP Console</a> to fix this.</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-secondary/20 border-gray-800/30 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-gray-800/30">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing Configuration</h3>
              </CardHeader>
              <ScrollShadow className="max-h-[350px]">
                <CardBody className="px-6 pb-12 grid grid-cols-2 gap-x-4 gap-y-12 pt-10">
                  <Input
                    type="number"
                    label="Rate / KM"
                    placeholder="0.00"
                    labelPlacement="outside"
                    startContent={<span className="text-gray-500 text-xs font-sans">R</span>}
                    name="ratePerKm"
                    value={settings.ratePerKm}
                    onChange={handleSettingChange}
                    classNames={{ label: "text-gray-400 font-bold", inputWrapper: "border-gray-800 focus-within:border-primary" }}
                  />
                  <Input
                    type="number"
                    label="Fuel Price"
                    placeholder="0.00"
                    labelPlacement="outside"
                    startContent={<span className="text-gray-500 text-xs font-sans">R</span>}
                    name="fuelPrice"
                    value={settings.fuelPrice}
                    onChange={handleSettingChange}
                    classNames={{ label: "text-gray-400 font-bold", inputWrapper: "border-gray-800 focus-within:border-primary" }}
                  />
                  <Input
                    id="l-100km-input"
                    type="number"
                    label="L/100km (Diesel)"
                    placeholder="15"
                    labelPlacement="outside"
                    name="consumption"
                    value={settings.consumption}
                    onChange={handleSettingChange}
                    classNames={{ label: "text-gray-400 font-bold", inputWrapper: "border-gray-800 focus-within:border-primary" }}
                  />
                  <Input
                    type="number"
                    label="Base Fee"
                    placeholder="0.00"
                    labelPlacement="outside"
                    startContent={<span className="text-gray-500 text-xs font-sans">R</span>}
                    name="baseRate"
                    value={settings.baseRate}
                    onChange={handleSettingChange}
                    classNames={{ label: "text-gray-400 font-bold", inputWrapper: "border-gray-800 focus-within:border-primary" }}
                  />
                </CardBody>
              </ScrollShadow>
            </Card>
          </motion.div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8 space-y-6">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[450px] relative rounded-3xl overflow-hidden border border-gray-800 bg-black/50"
          >
            <div ref={mapRef} className="w-full h-full opacity-80" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Chip radius="sm" className="bg-black/80 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-mono p-1">
                MAP_ENGINE_V2:STABLE
              </Chip>
            </div>
            {!isMapsLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 animate-pulse">
                <p className="text-gray-500 font-mono text-sm tracking-widest">INITIALIZING_GEODATA...</p>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {totalCost > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
              >
                <Card className="bg-primary/5 border border-primary/20 shadow-[0_0_50px_rgba(255,215,0,0.05)] overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Calculator size={120} className="text-primary rotate-12" />
                  </div>
                  <CardBody className="p-8">
                    <div className="flex flex-col md:flex-row gap-10 items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-primary font-mono text-xs uppercase tracking-[0.3em] font-bold">TOTAL ESTIMATED COST</p>
                        <h2 className="text-7xl font-black flex items-baseline gap-2">
                          <span className="text-2xl font-normal text-primary/60">R</span>
                          {totalCost.toFixed(0)}
                        </h2>
                        <div className="flex gap-4 mt-4">
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs bg-gray-500/10 px-2 py-1 rounded-md">
                            <Ruler size={12} /> {breakdown.distance} km
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs bg-gray-500/10 px-2 py-1 rounded-md">
                            <Clock size={12} /> {duration}
                          </div>
                        </div>
                      </div>

                      <ScrollShadow className="w-full md:w-auto min-w-[320px] max-h-[180px]">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                            <span className="text-gray-500 flex items-center gap-2"><Ruler size={14} /> Distance Fee</span>
                            <span className="font-mono font-bold">R {breakdown.service}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                            <span className="text-gray-500 flex items-center gap-2"><Zap size={14} /> Fuel Estimate</span>
                            <span className="font-mono font-bold">R {breakdown.fuel}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                            <span className="text-gray-500 flex items-center gap-2"><MapPin size={14} /> Base / Hookup</span>
                            <span className="font-mono font-bold">R {breakdown.base}</span>
                          </div>

                          <Button
                            variant="bordered"
                            color="default"
                            size="sm"
                            className="mt-4 border-gray-800 hover:bg-white hover:text-black font-bold uppercase tracking-wider"
                            startContent={<FileText size={16} />}
                          >
                            Export Document
                          </Button>
                        </div>
                      </ScrollShadow>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

export default App;
