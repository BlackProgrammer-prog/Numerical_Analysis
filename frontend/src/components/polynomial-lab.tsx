import { useState } from "react";
import { NUMERICAL_MODULES, type NumericalModuleId } from "./numerical-lab/config";
import { BivariateModule } from "./numerical-lab/modules/bivariate-module";
import { BoundsModule } from "./numerical-lab/modules/bounds-module";
import { HornerModule } from "./numerical-lab/modules/horner-module";
import { NewtonModule } from "./numerical-lab/modules/newton-module";

const MODULE_CONTENT: Record<NumericalModuleId, () => React.JSX.Element> = {
  horner: HornerModule,
  bounds: BoundsModule,
  newton: NewtonModule,
  bivariate: BivariateModule,
};

export function PolynomialLab() {
  const [activeModule, setActiveModule] = useState<NumericalModuleId>("horner");
  const ActiveModule = MODULE_CONTENT[activeModule];

  return (
    <div>
      <div className="mb-6 overflow-x-auto">
        <nav className="flex min-w-max gap-2 scro" aria-label="ماژول‌های محاسبات عددی">
          {NUMERICAL_MODULES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveModule(id)}
              aria-pressed={activeModule === id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 mb-20 text-sm font-medium ${activeModule === id ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
      <ActiveModule />
    </div>
  );
}
