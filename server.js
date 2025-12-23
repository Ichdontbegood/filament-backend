require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Připojení k MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Připojeno k MongoDB Cloudu'))
    .catch(err => console.error('❌ Chyba DB:', err));

// Databázový model (Schéma filamentu)
const filamentSchema = new mongoose.Schema({
    // Základní info
    brand: String,
    type: String,
    color: String,
    price: Number,          // Cena za cívku
    weightTotal: Number,    // Váha filamentu (čistá)
    weightLeft: Number,     // Kolik zbývá
    emptySpoolWeight: Number, // Váha prázdné cívky (NOVÉ)

    // Teploty
    tempNozzleMin: Number,  // (NOVÉ)
    tempNozzleMax: Number,  // (NOVÉ)
    tempBedMin: Number,     // (NOVÉ)
    tempBedMax: Number,     // (NOVÉ)

    // Rychlosti
    printSpeedMin: Number,  // (NOVÉ)
    printSpeedMax: Number,  // (NOVÉ)
    maxVolumetricSpeed: Number, // (NOVÉ)

    // Sušení
    dryingTemp: Number,     // (NOVÉ)
    dryingTime: Number,     // (NOVÉ - hodiny)

    // Systémové
    dateAdded: { type: Date, default: Date.now }
});

const Filament = mongoose.model('Filament', filamentSchema);

// --- API Endpointy ---

// Získat vše
app.get('/filaments', async (req, res) => {
    const filaments = await Filament.find().sort({ dateAdded: -1 });
    res.json(filaments);
});

// Přidat nový
app.post('/filaments', async (req, res) => {
    try {
        const newFilament = new Filament(req.body);
        await newFilament.save();
        res.status(201).json(newFilament);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Smazat
app.delete('/filaments/:id', async (req, res) => {
    await Filament.findByIdAndDelete(req.params.id);
    res.json({ message: "Smazáno" });
});

// Upravit (např. změna váhy)
app.patch('/filaments/:id', async (req, res) => {
    const updated = await Filament.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

app.listen(PORT, () => console.log(`🚀 Server běží na portu ${PORT}`));
