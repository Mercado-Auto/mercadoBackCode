import { Injectable } from "@nestjs/common";
import { intervalToDuration, parseISO , isEqual} from "date-fns";

@Injectable()
class DayjsDateProvider {
  constructor() {}

  compareBetweenDate(start_date: Date, end_date: Date): "Month" | "Day" {
    start_date = new Date(start_date)
    end_date = new Date(end_date)
    
    if(isEqual(parseISO(String(start_date)), parseISO(String(end_date)))) return 'Day'
    
    const formatted = intervalToDuration({
      start: start_date,
      end: end_date,
    });

    return formatted.months > 0 ? "Month" : "Day";
  }
}

export { DayjsDateProvider };
