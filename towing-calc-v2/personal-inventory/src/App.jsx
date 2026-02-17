import React, { useState, useEffect, useMemo } from 'react';
import {
    Card, CardHeader, CardBody, CardFooter,
    Input, Button, Chip, Tabs, Tab,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    useDisclosure, ScrollShadow, Divider, Tooltip,
    Badge
} from "@heroui/react";
import {
    Box, Search, Plus, Filter,
    TrendingUp, AlertTriangle, Package,
    MoreVertical, Edit3, Trash2,
    ShoppingBag, Layers, ShieldCheck, Settings,
    MapPin, Tag, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Electronics", "Furniture", "Tools", "Office", "Kitchen", "Misc"];

const INITIAL_ITEMS = [
    { id: 1, name: "Dell XPS 15", category: "Electronics", quantity: 2, price: 1800, location: "Shelf A1", status: "In Stock" },
    { id: 2, name: "Ergonomic Chair", category: "Furniture", quantity: 5, price: 350, location: "Bay 3", status: "In Stock" },
    { id: 3, name: "Power Drill", category: "Tools", quantity: 1, price: 120, location: "Locker 12", status: "Low Stock" },
];

export default function App() {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('inventory_items');
        return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    });
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category: "Misc",
        price: "",
        quantity: "",
        location: ""
    });

    useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name,
                category: editingItem.category,
                price: editingItem.price,
                quantity: editingItem.quantity,
                location: editingItem.location
            });
        } else {
            setFormData({ name: "", category: "Misc", price: "", quantity: "", location: "" });
        }
    }, [editingItem]);

    // Stats
    const stats = useMemo(() => {
        const total = items.reduce((acc, i) => acc + Number(i.quantity), 0);
        const value = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
        const lowStock = items.filter(i => i.quantity < 3).length;
        return { total, value, lowStock };
    }, [items]);

    // Filtered Items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === "all" || item.category === filter;
            return matchesSearch && matchesFilter;
        });
    }, [items, search, filter]);

    useEffect(() => {
        localStorage.setItem('inventory_items', JSON.stringify(items));
    }, [items]);

    const handleSave = () => {
        if (!formData.name || !formData.quantity || !formData.price) return;

        const itemToSave = {
            ...formData,
            id: editingItem ? editingItem.id : Date.now(),
            status: formData.quantity < 3 ? "Low Stock" : "In Stock"
        };

        if (editingItem) {
            setItems(items.map(i => i.id === editingItem.id ? itemToSave : i));
        } else {
            setItems([itemToSave, ...items]);
        }
        onOpenChange(false);
    };

    const deleteItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#0c0c0e] text-slate-200 p-4 md:p-8 selection:bg-indigo-500/30">
            {/* Background Mesh */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[100px]" />
            </div>

            <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/40 border border-indigo-400/30">
                        <Box size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight gradient-text text-balance">Humaira's Personal Inventory</h1>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">System v1.0.0</p>
                    </div>
                </motion.div>

                <div className="flex gap-3">
                    <Button
                        className="bg-indigo-600 text-white font-black px-6 shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform"
                        startContent={<Plus size={20} strokeWidth={3} />}
                        onPress={() => { setEditingItem(null); onOpen(); }}
                    >
                        INTAKE NEW ITEM
                    </Button>
                    <Button
                        variant="flat"
                        className="bg-slate-800/50 text-slate-300 border border-white/5 backdrop-blur-md"
                        isIconOnly
                    >
                        <Settings size={20} />
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-10 relative z-10">
                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Total Units", value: stats.total.toLocaleString(), icon: Package, color: "indigo" },
                        { label: "Portfolio Value", value: `R${stats.value.toLocaleString()}`, icon: TrendingUp, color: "emerald" },
                        { label: "Deficit Alerts", value: stats.lowStock, icon: AlertTriangle, color: "amber" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="glass-card p-6 border-white/5 hover:border-white/10 transition-all group overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <stat.icon size={80} />
                                </div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-slate-500 text-xs font-black uppercase tracking-tighter mb-2">{stat.label}</p>
                                        <h2 className="text-4xl font-black tracking-tighter">{stat.value}</h2>
                                    </div>
                                    <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20 shadow-lg`}>
                                        <stat.icon size={28} />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </section>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div className="w-full lg:max-w-lg">
                        <Input
                            isClearable
                            placeholder="Scan or Search Inventory..."
                            startContent={<Search className="text-indigo-500" size={20} />}
                            value={search}
                            onValueChange={setSearch}
                            className="rounded-2xl"
                            variant="bordered"
                            classNames={{
                                inputWrapper: "bg-slate-900/40 border-white/10 backdrop-blur-xl h-14 group-data-[focus=true]:border-indigo-500/50",
                                input: "text-lg font-medium",
                            }}
                        />
                    </div>

                    <ScrollShadow orientation="horizontal" className="w-full lg:w-auto" hideScrollBar>
                        <Tabs
                            variant="light"
                            color="primary"
                            selectedKey={filter}
                            onSelectionChange={setFilter}
                            classNames={{
                                tabList: "bg-slate-900/40 border border-white/5 p-1 rounded-2xl backdrop-blur-xl",
                                cursor: "bg-indigo-600 rounded-xl shadow-lg ring-2 ring-indigo-400/20",
                                tab: "px-6 h-10 font-bold uppercase text-[10px] tracking-widest",
                                tabContent: "group-data-[selected=true]:text-white text-slate-500"
                            }}
                        >
                            <Tab key="all" title={<div className="flex items-center gap-2"><Layers size={14} /> ALL ASSETS</div>} />
                            {CATEGORIES.map(cat => (
                                <Tab key={cat} title={cat} />
                            ))}
                        </Tabs>
                    </ScrollShadow>
                </div>

                {/* Inventory Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <Card className="glass-card h-full group hover:-translate-y-2 transition-transform duration-300 border-white/5 hover:border-indigo-500/30">
                                    <CardHeader className="flex flex-col items-start gap-1 p-6 pb-2">
                                        <div className="w-full flex justify-between items-center mb-4">
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                className={`bg-${item.quantity < 3 ? 'amber' : 'indigo'}-500/10 text-${item.quantity < 3 ? 'amber' : 'indigo'}-400 font-black border border-${item.quantity < 3 ? 'amber' : 'indigo'}-500/20`}
                                            >
                                                {item.category}
                                            </Chip>
                                            <Dropdown backdrop="blur" classNames={{ content: "bg-slate-900/90 border border-white/10 backdrop-blur-2xl" }}>
                                                <DropdownTrigger>
                                                    <Button variant="light" isIconOnly size="sm" className="hover:bg-white/10">
                                                        <MoreVertical size={18} className="text-slate-500" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownMenu aria-label="Item actions" color="primary">
                                                    <DropdownItem
                                                        key="edit"
                                                        startContent={<Edit3 size={16} />}
                                                        className="font-bold py-3"
                                                        onPress={() => { setEditingItem(item); onOpen(); }}
                                                    >
                                                        COMMAND: EDIT
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        className="text-danger font-bold py-3"
                                                        color="danger"
                                                        startContent={<Trash2 size={16} />}
                                                        onPress={() => deleteItem(item.id)}
                                                    >
                                                        TERMINATE RECORD
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                        <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight leading-tight">{item.name}</h3>
                                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">
                                            <MapPin size={10} /> {item.location}
                                        </div>
                                    </CardHeader>

                                    <CardBody className="px-6 py-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-4xl font-black text-white tracking-tighter">
                                                    {item.quantity}
                                                    <span className="text-slate-500 text-xs font-bold ml-1.5 uppercase tracking-widest opacity-50">Units</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 opacity-50">Market Value</p>
                                                <p className="text-2xl font-black text-emerald-400 tracking-tighter">R{item.price}</p>
                                            </div>
                                        </div>
                                    </CardBody>

                                    <Divider className="bg-white/5 mx-6" />

                                    <CardFooter className="px-6 py-4 flex justify-between gap-3">
                                        <Tooltip content={`Status: ${item.quantity < 3 ? 'CRITICAL STOCK' : 'OPTIMAL'}`} placement="top">
                                            <div className={`p-2.5 rounded-xl bg-${item.quantity < 3 ? 'amber' : 'indigo'}-500/10 border border-${item.quantity < 3 ? 'amber' : 'indigo'}-500/20`}>
                                                <ShieldCheck size={18} className={`text-${item.quantity < 3 ? 'amber' : 'indigo'}-400`} />
                                            </div>
                                        </Tooltip>
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="bg-indigo-500/5 text-indigo-400 font-black flex-1 border border-indigo-500/20 hover:bg-indigo-500/10 hover:scale-105 transition-all"
                                            startContent={<ShoppingBag size={14} />}
                                        >
                                            TRANSFER
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </section>

                {filteredItems.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="p-8 bg-slate-900/50 rounded-full border border-white/5 mb-6 backdrop-blur-xl">
                            <Search size={48} className="text-slate-700" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-400">No resources found</h3>
                        <p className="text-slate-600 max-w-xs mt-2">Adjust your search parameters or intake a new item into the system.</p>
                    </motion.div>
                )}
            </main>

            {/* Intake Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop="blur"
                classNames={{
                    base: "bg-[#0c0c0e]/90 border border-white/10 backdrop-blur-2xl",
                    header: "border-b border-white/5 py-6 px-8",
                    body: "py-8 px-8",
                    footer: "border-t border-white/5 py-6 px-8",
                    closeButton: "hover:bg-white/10 active:bg-white/20 transition-colors"
                }}
                size="xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <h2 className="text-3xl font-black tracking-tight uppercase">
                                    {editingItem ? "Update Asset Record" : "Digital Intake Authorization"}
                                </h2>
                                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">System Clearance Level: Admin</p>
                            </ModalHeader>
                            <ModalBody className="gap-8">
                                <Input
                                    label="RESOURCE IDENTIFIER"
                                    placeholder="Enter item name or SKU..."
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: "h-16 border-white/10 focus-within:!border-indigo-500",
                                        label: "font-black text-xs uppercase tracking-widest text-slate-500 mb-1"
                                    }}
                                    value={formData.name}
                                    onValueChange={(val) => setFormData({ ...formData, name: val })}
                                    startContent={<Tag size={18} className="text-indigo-500" />}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Dropdown backdrop="blur" classNames={{ content: "bg-slate-900/90 border border-white/10" }}>
                                        <DropdownTrigger>
                                            <Button
                                                variant="bordered"
                                                className="h-16 w-full border-white/10 text-left justify-between px-4 hover:border-white/20"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CLASSIFICATION</span>
                                                    <span className="font-bold text-lg">{formData.category}</span>
                                                </div>
                                                <Filter size={18} className="text-indigo-500" />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            aria-label="Category Selection"
                                            variant="flat"
                                            color="primary"
                                            selectionMode="single"
                                            selectedKeys={[formData.category]}
                                            onSelectionChange={(keys) => setFormData({ ...formData, category: Array.from(keys)[0] })}
                                        >
                                            {CATEGORIES.map(cat => <DropdownItem key={cat} className="font-bold py-3 uppercase text-xs">{cat}</DropdownItem>)}
                                        </DropdownMenu>
                                    </Dropdown>

                                    <Input
                                        label="UNIT VALUATION (R)"
                                        placeholder="0.00"
                                        variant="bordered"
                                        type="number"
                                        classNames={{
                                            inputWrapper: "h-16 border-white/10 focus-within:!border-indigo-500",
                                            label: "font-black text-xs uppercase tracking-widest text-slate-500 mb-1"
                                        }}
                                        value={formData.price}
                                        onValueChange={(val) => setFormData({ ...formData, price: val })}
                                        startContent={<DollarSign size={18} className="text-emerald-500" />}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Input
                                        label="INITIAL QUANTITY"
                                        placeholder="1"
                                        variant="bordered"
                                        type="number"
                                        classNames={{
                                            inputWrapper: "h-16 border-white/10 focus-within:!border-indigo-500",
                                            label: "font-black text-xs uppercase tracking-widest text-slate-500 mb-1"
                                        }}
                                        value={formData.quantity}
                                        onValueChange={(val) => setFormData({ ...formData, quantity: val })}
                                        startContent={<Package size={18} className="text-indigo-500" />}
                                    />
                                    <Input
                                        label="STORAGE CO-ORDINATES"
                                        placeholder="e.g. Sector-B4"
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper: "h-16 border-white/10 focus-within:!border-indigo-500",
                                            label: "font-black text-xs uppercase tracking-widest text-slate-500 mb-1"
                                        }}
                                        value={formData.location}
                                        onValueChange={(val) => setFormData({ ...formData, location: val })}
                                        startContent={<MapPin size={18} className="text-indigo-500" />}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} className="font-black uppercase tracking-widest text-slate-500">
                                    Abort
                                </Button>
                                <Button
                                    className="bg-indigo-600 text-white font-black uppercase tracking-widest px-10 shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
                                    onPress={handleSave}
                                >
                                    {editingItem ? "Commit Changes" : "Confirm Authorization"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
