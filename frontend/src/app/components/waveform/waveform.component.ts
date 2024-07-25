import {AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {AudioService} from "../../services/audio/audio.service";
import {AudioAnalyser} from "../../utils/audio-analyser";

@Component({
  selector: 'app-waveform',
  standalone: true,
  imports: [],
  templateUrl: './waveform.component.html',
  styleUrl: './waveform.component.css'
})
export class WaveformComponent implements AfterViewInit{

  @Input() bars!:number
  stream: MediaStream|undefined

  @ViewChild("container") container!: ElementRef
  @ViewChildren("bar") levelBars!:QueryList<ElementRef>

  barHeights:number[] = []

  audioAnalyser:AudioAnalyser|undefined

  constructor(
    private audioService: AudioService
  ) {
  }

  ngAfterViewInit(){
    this.barHeights = new Array<number>(this.bars).fill(0)
    this.startAnalyser()
      .then(()=>{this.mainLoop()})
      .catch(console.error)
  }

  async startAnalyser(){
    // TODO this should be done from user input
    this.stream = await this.audioService.getMicInput()
    this.audioAnalyser = new AudioAnalyser(this.stream as MediaStream, this.bars)
  }

  mainLoop(){

    try {
      if(this.audioAnalyser){
        const barHeights = this.audioAnalyser.getFrequency()
        this.levelBars.forEach((b, index) => {
          // Scale height of bar based on
          b.nativeElement.style.height = `${barHeights[index] * (((index)/(index+1/2))+1) * this.container.nativeElement.clientHeight}px`
        })
      }
    } catch (e) {
      console.error(e)
    }

    window.requestAnimationFrame(this.mainLoop.bind(this))
  }

  protected readonly Array = Array;
}