namespace dotnetapi.Helpers
{    
    public class Microservices 
    {
        public Microservice[] services { get; set; }
    }
    public class Microservice 
    {
        public Microservice() {

        }
        public string Name { get; set;}
        public string Url { get; set; }
    }
}