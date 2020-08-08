namespace dotnetapi.Entities
{
    enum CredentialType 
    {
        Password,
        CreditCard,
        Username,
        Email
    }

    public class Credential
    {
        public int Id { get; set; }
        public int UserId {get; set; }
        public int? Type { get; set; }
        public string Hint { get; set; }
        public string AesValue { get; set; }
        public string AesIV { get; set; }
        public string Domain { get; set; }
    }
}