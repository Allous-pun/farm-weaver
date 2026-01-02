import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFarm } from '@/context/FarmContext';
import { 
  AnimalCategory, 
  TrackingFeature, 
  AnimalTerminology,
  CATEGORY_OPTIONS, 
  FEATURE_OPTIONS, 
  ANIMAL_ICONS, 
  ANIMAL_COLORS,
  MEASUREMENT_UNITS 
} from '@/types/animal';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnimalSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export function AnimalSetupWizard({ isOpen, onClose }: AnimalSetupWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AnimalCategory>('livestock');
  const [icon, setIcon] = useState('🐰');
  const [color, setColor] = useState(ANIMAL_COLORS[0]);
  const [measurementUnit, setMeasurementUnit] = useState('kg');
  const [features, setFeatures] = useState<TrackingFeature[]>(['feed', 'health']);
  const [terminology, setTerminology] = useState<AnimalTerminology>({
    youngName: '',
    maleName: '',
    femaleName: '',
    birthEventName: '',
  });

  const { addAnimalType, selectAnimalType } = useFarm();
  const { toast } = useToast();

  const handleFeatureToggle = (feature: TrackingFeature) => {
    setFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter an animal name.',
        variant: 'destructive',
      });
      return;
    }
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleComplete = () => {
    addAnimalType({
      name: name.trim(),
      category,
      icon,
      color,
      measurementUnit,
      features,
      terminology: {
        youngName: terminology.youngName || 'young',
        maleName: terminology.maleName || 'male',
        femaleName: terminology.femaleName || 'female',
        birthEventName: terminology.birthEventName || 'birth',
      },
    });

    toast({
      title: 'Animal added!',
      description: `${name} has been added to your farm.`,
    });

    // Reset form
    setStep(1);
    setName('');
    setCategory('livestock');
    setIcon('🐰');
    setColor(ANIMAL_COLORS[0]);
    setFeatures(['feed', 'health']);
    setTerminology({ youngName: '', maleName: '', femaleName: '', birthEventName: '' });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-border/50 animate-scale-in">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Progress */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <CardTitle className="text-2xl">
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Select Features'}
            {step === 3 && 'Customize Terms'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Tell us about the animal you want to manage'}
            {step === 2 && 'Choose what you want to track'}
            {step === 3 && 'Define your terminology (optional)'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-medium">Animal Name *</label>
                <Input
                  placeholder="e.g., Rabbit, Cow, Chicken..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCategory(opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        category === opt.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ANIMAL_ICONS.map((i) => (
                    <button
                      key={i}
                      onClick={() => setIcon(i)}
                      className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all hover:scale-105 ${
                        icon === i
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {ANIMAL_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-105 ${
                        color === c ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Measurement Unit</label>
                <div className="flex flex-wrap gap-2">
                  {MEASUREMENT_UNITS.map((u) => (
                    <button
                      key={u}
                      onClick={() => setMeasurementUnit(u)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        measurementUnit === u
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              {FEATURE_OPTIONS.map((feature) => (
                <button
                  key={feature.value}
                  onClick={() => handleFeatureToggle(feature.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    features.includes(feature.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{feature.label}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      features.includes(feature.value)
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {features.includes(feature.value) && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Terminology */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-muted-foreground">
                Customize the terms used in your dashboard (leave blank for defaults).
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Young Name</label>
                  <Input
                    placeholder="e.g., kit, calf, chick"
                    value={terminology.youngName}
                    onChange={(e) => setTerminology(prev => ({ ...prev, youngName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Male Name</label>
                  <Input
                    placeholder="e.g., buck, bull, rooster"
                    value={terminology.maleName}
                    onChange={(e) => setTerminology(prev => ({ ...prev, maleName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Female Name</label>
                  <Input
                    placeholder="e.g., doe, cow, hen"
                    value={terminology.femaleName}
                    onChange={(e) => setTerminology(prev => ({ ...prev, femaleName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Birth Event</label>
                  <Input
                    placeholder="e.g., kindling, calving, hatching"
                    value={terminology.birthEventName}
                    onChange={(e) => setTerminology(prev => ({ ...prev, birthEventName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-6 rounded-xl bg-gradient-card border border-border/50">
                <h4 className="font-medium mb-4">Preview</h4>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: color + '20' }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div className="text-xl font-display font-bold">{name || 'Animal'}</div>
                    <div className="text-sm text-muted-foreground capitalize">{category}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {features.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {f}
                        </span>
                      ))}
                      {features.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          +{features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? 'opacity-0' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleComplete}>
                Create Dashboard
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
