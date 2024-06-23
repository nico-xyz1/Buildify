import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSelect, IonSelectOption, IonLabel } from '@ionic/angular/standalone';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HardwareService } from '../../services/hardware.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSelect, IonSelectOption, IonLabel],
})
export class MainPage implements OnInit {
  form: FormGroup;
  cpuData: any[];
  gpuData: any[];
  motherboardData: any[];
  ramData: any[];
  storageData: any[];
  psuData: any[];
  caseData: any[];
  coolerData: any[];
  selectedCpuSocket: string = '';
  selectedRam: any;
  selectedCase: any;
  filteredMotherboardData: any[] = [];
  filteredRamData: any[] = [];
  isCompatible: boolean = true;
  filteredCaseData: any[];

  constructor(private hardwareService: HardwareService) { }

  ngOnInit() {
    this.initializeForm();
    this.fetchHardwareData();
  }

  // Inicializa formulario reactivo para manejar la compatibilidad de hardware
  initializeForm() {
    this.form = new FormGroup({
      cpu: new FormGroup({
        brand: new FormControl(null, { validators: [Validators.required] }),
        model: new FormControl(null, { validators: [Validators.required] }),
        socket: new FormControl(null, { validators: [Validators.required] })
      }),
      gpu: new FormGroup({
        brand: new FormControl(null, { validators: [Validators.required] }),
        model: new FormControl(null, { validators: [Validators.required] }),
        length: new FormControl(null, { validators: [Validators.required]}) 
      }),
      motherboard: new FormGroup({
        brand: new FormControl(null, { validators: [Validators.required] }),
        model: new FormControl(null, { validators: [Validators.required] }),
        socket: new FormControl(null, { validators: [Validators.required] })
      }),
      case: new FormGroup({
        brand: new FormControl(null, { validators: [Validators.required] }),
        model: new FormControl(null, { validators: [Validators.required] }),
        maxGpuLength: new FormControl(null, { validators: [Validators.required] }) // Assuming 'maxGpuLength' is a relevant property for cases
      }),
    });
    // this.form.valueChanges.subscribe(values => {
    //   this.checkCompatibility(values);
    // });
  }

  // checkCompatibility(values: any) {
  //   const cpu = values.cpu;
  //   const motherboard = values.motherboard;
  //   const gpu = values.gpu;
  //   const ram = values.ram;
  //   const storage = values.storage;
  //   const psu = values.psu;
  //   const caseHardware = values.case;
  //   const cooler = values.cooler;

  //   // Chequea si ambos campos de CPU y Motherboard estan completos
  //   if (cpu.socket && motherboard.socket) {
  //     // Chequea si el socket del CPU es compatible con el socket de la motherboard
  //     if (this.isCompatible = cpu.socket === motherboard.socket) {
  //       console.log('CPU and Motherboard are compatible.');
  //     } else {
  //       console.log('CPU and Motherboard are not compatible.');
  //     }
  //   }
  // }

  // Extrae datos de hardware de la API mediante servicio
  fetchHardwareData() {
    this.hardwareService.getCpuData().subscribe(data => this.cpuData = data);
    this.hardwareService.getGpuData().subscribe(data => this.gpuData = data);
    this.hardwareService.getMotherboardData().subscribe(data => this.motherboardData = data);
    this.hardwareService.getRamData().subscribe(data => this.ramData = data);
    this.hardwareService.getCaseData().subscribe(data => this.caseData = data);
  }

  filterHardware(hardwareType: string, selectedValue: any) {
    switch (hardwareType) {
      case 'cpu':
        this.selectedCpuSocket = selectedValue.socket;
        this.filteredMotherboardData = this.motherboardData.filter(motherboard => motherboard.socket === this.selectedCpuSocket);
        break;
      case 'motherboard':
        this.form.get('motherboard').setValue({
          brand: selectedValue.brand,
          model: selectedValue.model,
          socket: selectedValue.socket
        });
        if (this.ramData && this.ramData.length > 0) {
          this.filteredRamData = this.ramData.filter(ram => ram.type === selectedValue.ram_type);
        } else {
          console.error('RAM data is not loaded yet');
        }
        break;
      case 'gpu':
        this.form.get('gpu').setValue({
          brand: selectedValue.brand,
          model: selectedValue.model,
          length: selectedValue.length
        });
        // Filter cases based on GPU length
        this.filteredCaseData = this.caseData.filter(caseItem => caseItem.maxGpuLength >= selectedValue.length);
        break;
      // Add cases for other hardware types as needed
      default:
        console.warn(`No filter logic defined for hardware type: ${hardwareType}`);
    }
  }

  // Metodos para extraer datos de hardware seleccionado
  onCpuSelect(event: any) {
    const selectedCpu = event.detail.value;

    this.form.get('cpu').setValue({
      brand: selectedCpu.brand,
      model: selectedCpu.model,
      socket: selectedCpu.socket
    });
    this.selectedCpuSocket = selectedCpu.socket;
    // this.filterMotherboards();
    this.filterHardware('cpu', selectedCpu);
  }

  // Filtra las motherboards por socket de CPU seleccionado
  // filterMotherboards() {
  //   this.filteredMotherboardData = this.motherboardData.filter(motherboard => motherboard.socket === this.selectedCpuSocket);
  // }

  onMotherboardSelect(event: any) {
    const selectedMotherboard = event.detail.value;
    this.filterHardware('motherboard', selectedMotherboard);
  }

  onRamSelect(event: any) {
    this.form.get('ram').setValue(event.detail.value);
  }

  onGpuSelect(event: any) {
    const selectedGpu = event.detail.value;
    this.filterHardware('gpu', selectedGpu);
  }
  
  onCaseSelect(event: any) {
    const selectedCase = event.detail.value;
    this.form.get('case').setValue({
      brand: selectedCase.brand,
      model: selectedCase.model,
      maxGpuLength: selectedCase.maxGpuLength
    });
  }

  onStorageSelect(event: any) {
    this.form.get('storage').setValue(event.detail.value);
  }  

}