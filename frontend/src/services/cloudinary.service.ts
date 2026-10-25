import api from './api';

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

export const CLOUDINARY_CONFIG = {
  cloudName: 'ecopulse-demo',
  uploadPreset: 'ecopulse_sustainability',
};

// Preset high-resolution sustainability proof templates for instant testing
export const ECO_PROOF_TEMPLATES = [
  {
    label: '🚴 Zero-Emission Commute',
    tag: '#ZeroEmissionCommute',
    co2: 2.5,
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
    caption: 'Pedaled to campus instead of motor transport. Fresh air + zero fossil fuel!'
  },
  {
    label: '🥗 100% Plant-Based Dining',
    tag: '#PlantFuelChampion',
    co2: 1.8,
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
    caption: 'Chose a spiced chickpea and roasted veggie bowl at the dining hall today!'
  },
  {
    label: '♻️ Circular Campus Thrift Drop',
    tag: '#CircularThriftDrop',
    co2: 5.4,
    url: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1000&q=80',
    caption: 'Passed down my course textbook to a peer. Avoided raw manufacturing footprint!'
  },
  {
    label: '⚡ Solar Study Pod / Standby Off',
    tag: '#SolarEnergyStudy',
    co2: 2.1,
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80',
    caption: 'Studied in the solar-powered library atrium and turned off room vampire power.'
  },
  {
    label: '💧 Smart Reusable Bottle Hydration',
    tag: '#PlasticFreeCampus',
    co2: 1.2,
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80',
    caption: 'Tapped into the campus smart filtered water refill hub. Zero single-use bottles!'
  },
  {
    label: '🌱 Native Sapling Campus Planting',
    tag: '#CampusGreening',
    co2: 8.0,
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    caption: 'Participated in the weekend tree planting initiative by the hostel eco-club.'
  }
];

export const cloudinaryService = {
  /**
   * Upload an image file or base64 string to Cloudinary via backend /api/upload endpoint
   */
  async uploadImage(fileOrBase64: File | string, title?: string): Promise<string> {
    try {
      let base64Data: string;

      if (typeof fileOrBase64 === 'string') {
        base64Data = fileOrBase64;
      } else {
        base64Data = await this.fileToBase64(fileOrBase64);
      }

      const { data } = await api.post('/upload/image', {
        image_base64: base64Data,
        title: title || 'carbon_reduction_proof',
      });

      return data.url;
    } catch (err) {
      console.warn('Cloudinary upload error, using fallback template', err);
      return ECO_PROOF_TEMPLATES[0].url;
    }
  },

  /**
   * Convert client File to base64 data URI
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },
};
